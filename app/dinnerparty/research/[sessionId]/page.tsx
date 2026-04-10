'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ResearchProgress from '@/components/ResearchProgress';
import { getFromClientCache, setInClientCache } from '@/lib/researchCache';
import { FIGURES, type HistoricalFigure } from '@/lib/figures';

const KNOWN_FEMALE_IDS = new Set([
  'simone-de-beauvoir', 'hannah-arendt', 'simone-weil', 'marie-curie',
  'ada-lovelace', 'rosalind-franklin', 'rachel-carson', 'jane-austen',
  'virginia-woolf', 'toni-morrison', 'zora-neale-hurston', 'octavia-butler',
  'harriet-tubman', 'eleanor-roosevelt', 'ida-b-wells', 'sojourner-truth',
  'angela-davis', 'joan-rivers', 'moms-mabley', 'nora-ephron',
  'phyllis-diller', 'nina-simone', 'billie-holiday', 'aretha-franklin',
  'patti-smith', 'grace-hopper', 'bell-hooks', 'roxane-gay', 'brene-brown',
  'susan-sontag', 'frida-kahlo', 'georgia-okeeffe', 'maya-angelou',
  'mary-wollstonecraft', 'cleopatra', 'marie-antoinette', 'hypatia',
  'harriet-beecher-stowe', 'sylvia-plath', 'mary-shelley', 'emily-dickinson',
  'ella-fitzgerald', 'wu-zetian', 'amelia-earhart',
  'michelle-obama', 'dolly-parton', 'oprah-winfrey',
  'laura-ingalls-wilder',
]);

interface SessionData {
  id: string;
  figureIds: string[];
  customFigures?: HistoricalFigure[];
  depth: 'quick' | 'deep';
  topic: string;
  topicCategory: string;
  userParticipating: boolean;
  userName?: string;
  userBackground?: string;
}

interface ResearchStatus {
  figureId: string;
  figureName: string;
  stage: string;
  progress: number;
  complete: boolean;
  error?: string;
  result?: unknown;
}

export default function ResearchPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [statuses, setStatuses] = useState<ResearchStatus[]>([]);
  const [allComplete, setAllComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasStarted = useRef(false);

  const researchOneFigure = async (
    figureId: string,
    depth: 'quick' | 'deep',
    staggerDelay: number
  ): Promise<{ figureId: string; result: unknown; error?: string }> => {
    // Check client-side cache first
    const cached = getFromClientCache(figureId, depth);
    if (cached) {
      setStatuses((prev) =>
        prev.map((s) =>
          s.figureId === figureId
            ? { ...s, complete: true, progress: 100, stage: 'complete', result: cached }
            : s
        )
      );
      return { figureId, result: cached };
    }

    // Small stagger so cards don't all move at once — feels more natural
    if (staggerDelay > 0) {
      await new Promise((r) => setTimeout(r, staggerDelay));
    }

    // Start: 10%
    setStatuses((prev) =>
      prev.map((s) =>
        s.figureId === figureId
          ? { ...s, stage: 'researching', progress: 15 }
          : s
      )
    );

    try {
      const response = await fetch('/api/dinnerparty/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ figureId, depth }),
      });

      // Bump to 80% once server responds (main wait is the Claude API call)
      setStatuses((prev) =>
        prev.map((s) =>
          s.figureId === figureId
            ? { ...s, stage: 'synthesizing', progress: 80 }
            : s
        )
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      // Save to client cache
      if (data.result) {
        setInClientCache(figureId, depth, data.result);
      }

      // Mark complete
      setStatuses((prev) =>
        prev.map((s) =>
          s.figureId === figureId
            ? { ...s, complete: true, progress: 100, stage: 'complete', result: data.result }
            : s
        )
      );

      return { figureId, result: data.result };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Research failed';

      setStatuses((prev) =>
        prev.map((s) =>
          s.figureId === figureId
            ? { ...s, error: errMsg, progress: 100, complete: true }
            : s
        )
      );

      return { figureId, result: null, error: errMsg };
    }
  };

  const startResearch = useCallback(async () => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const stored = sessionStorage.getItem(`dinner-session-${sessionId}`);
    if (!stored) {
      setError('Session not found. Please go back and set up your dinner party.');
      return;
    }

    const sessionData: SessionData = JSON.parse(stored);

    // Build a combined lookup of all figures (hardcoded + custom)
    const customFigureMap = new Map<string, HistoricalFigure>();
    if (sessionData.customFigures) {
      for (const cf of sessionData.customFigures) {
        customFigureMap.set(cf.id, cf);
      }
      // Register custom figures with the server so the research API can find them
      for (const cf of sessionData.customFigures) {
        try {
          await fetch('/api/dinnerparty/figures/custom', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ figure: cf }),
          });
        } catch {
          // Non-fatal — research API may still find it
        }
      }
    }
    const findFigure = (id: string): HistoricalFigure | undefined =>
      FIGURES.find((f) => f.id === id) || customFigureMap.get(id);

    // Initialize statuses
    const initialStatuses = sessionData.figureIds.map((id) => {
      const fig = findFigure(id);
      return {
        figureId: id,
        figureName: fig?.name || id
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        stage: 'waiting',
        progress: 2,
        complete: false,
      };
    });
    setStatuses(initialStatuses);

    // Research all figures in parallel with slight stagger (200ms apart)
    const promises = sessionData.figureIds.map((id, i) =>
      researchOneFigure(id, sessionData.depth, i * 200)
    );

    const outcomes = await Promise.all(promises);

    // Collect results
    const results: Record<string, unknown> = {};
    for (const outcome of outcomes) {
      if (outcome.result) {
        results[outcome.figureId] = outcome.result;
      }
    }

    // Match voices for all figures using ElevenLabs voice discovery
    let voiceAssignments: Record<string, { voiceId: string; voiceName: string }> = {};
    try {
      const figureRequests = sessionData.figureIds.map((id) => {
        const figure = findFigure(id);
        // Detect gender: check known set, or guess from voicePersonality/name for custom figures
        let gender: 'male' | 'female' = 'male';
        if (KNOWN_FEMALE_IDS.has(id)) {
          gender = 'female';
        } else if (figure) {
          const vp = (figure.voicePersonality + ' ' + figure.name).toLowerCase();
          if (vp.includes('female') || vp.includes('woman') || vp.includes('her ') || vp.includes('she ') || vp.includes('actress') || vp.includes('queen') || vp.includes('empress')) {
            gender = 'female';
          }
        }
        let age: 'young' | 'middle_aged' | 'old' | undefined;
        if (figure) {
          const vp = figure.voicePersonality.toLowerCase();
          if (vp.includes('young') || vp.includes('youthful')) age = 'young';
          else if (vp.includes('elder') || vp.includes('wise old') || vp.includes('aged')) age = 'old';
          else age = 'middle_aged';
        }
        return {
          figureId: id,
          name: figure?.name || id.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          gender,
          nationality: figure?.nationality || 'American',
          voicePersonality: figure?.voicePersonality || '',
          age,
          // Rich data for better voice matching
          writingStyle: figure?.writingStyle || '',
          knownFor: figure?.knownFor || [],
          categories: figure?.category || [],
          tagline: figure?.tagline || '',
          born: figure?.born || '',
          died: figure?.died || '',
        };
      });

      const voiceResponse = await fetch('/api/dinnerparty/voices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ figures: figureRequests }),
      });

      if (voiceResponse.ok) {
        const voiceData = await voiceResponse.json();
        for (const assignment of voiceData.assignments || []) {
          voiceAssignments[assignment.figureId] = {
            voiceId: assignment.voiceId,
            voiceName: assignment.voiceName,
          };
        }
        console.log(`[Research] Matched ${Object.keys(voiceAssignments).length} voices from ElevenLabs library`);
      }
    } catch (err) {
      console.warn('[Research] Voice discovery failed, will use fallback voices:', err);
    }

    // Store results and navigate
    const fullSession = {
      ...sessionData,
      researchResults: results,
      voiceAssignments,
    };
    sessionStorage.setItem(
      `dinner-session-${sessionId}`,
      JSON.stringify(fullSession)
    );

    setAllComplete(true);
    setTimeout(() => {
      router.push(`/dinnerparty/dinner/${sessionId}`);
    }, 1500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, router]);

  useEffect(() => {
    startResearch();
  }, [startResearch]);

  return (
    <div className="min-h-screen bg-dinner-bg flex items-center justify-center p-4">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-dinner-candle/3 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full bg-dinner-wine/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        {error ? (
          <div className="text-center space-y-4">
            <p className="text-red-600 font-body">{error}</p>
            <button
              onClick={() => router.push('/dinnerparty')}
              className="px-4 py-2 bg-dinner-card border border-dinner-border rounded-lg text-dinner-cream text-sm font-serif
                hover:border-dinner-gold/30 transition-colors"
            >
              Return to guest selection
            </button>
          </div>
        ) : (
          <>
            <ResearchProgress statuses={statuses} />
            {allComplete && (
              <div className="text-center mt-8 animate-fade-in">
                <button
                  onClick={() => router.push(`/dinnerparty/dinner/${sessionId}`)}
                  className="px-6 py-3 bg-dinner-terracotta text-white rounded-lg
                    font-serif hover:bg-dinner-terracotta/90 transition-all shadow-md shadow-dinner-terracotta/20"
                >
                  Enter the dining room
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
