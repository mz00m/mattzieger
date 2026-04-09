'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ResearchProgress from '@/components/ResearchProgress';

interface SessionData {
  id: string;
  figureIds: string[];
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
    depth: 'quick' | 'deep'
  ): Promise<{ figureId: string; result: unknown; error?: string }> => {
    // Update status to in-progress
    setStatuses((prev) =>
      prev.map((s) =>
        s.figureId === figureId
          ? { ...s, stage: 'quick-research', progress: 30 }
          : s
      )
    );

    try {
      const response = await fetch('/api/dinnerparty/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ figureId, depth }),
      });

      // Update to 70% while parsing
      setStatuses((prev) =>
        prev.map((s) =>
          s.figureId === figureId
            ? { ...s, stage: 'synthesizing', progress: 70 }
            : s
        )
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

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

    // Initialize statuses
    const initialStatuses = sessionData.figureIds.map((id) => ({
      figureId: id,
      figureName: id
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      stage: 'starting',
      progress: 5,
      complete: false,
    }));
    setStatuses(initialStatuses);

    // Research all figures in parallel — each one is a separate API call
    const promises = sessionData.figureIds.map((id) =>
      researchOneFigure(id, sessionData.depth)
    );

    const outcomes = await Promise.all(promises);

    // Collect results
    const results: Record<string, unknown> = {};
    for (const outcome of outcomes) {
      if (outcome.result) {
        results[outcome.figureId] = outcome.result;
      }
    }

    // Store results and navigate
    const fullSession = {
      ...sessionData,
      researchResults: results,
    };
    sessionStorage.setItem(
      `dinner-session-${sessionId}`,
      JSON.stringify(fullSession)
    );

    setAllComplete(true);
    setTimeout(() => {
      router.push(`/dinnerparty/dinner/${sessionId}`);
    }, 2000);
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
            <p className="text-red-400 font-body">{error}</p>
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
                  className="px-6 py-3 bg-dinner-gold/20 border border-dinner-gold text-dinner-gold-light rounded-lg
                    font-serif hover:bg-dinner-gold/30 transition-all shadow-lg shadow-dinner-gold/10"
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
