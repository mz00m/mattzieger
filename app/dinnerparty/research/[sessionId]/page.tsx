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
      progress: 0,
      complete: false,
    }));
    setStatuses(initialStatuses);

    try {
      // Use SSE endpoint for streaming progress
      const url = `/api/dinnerparty/research?figureIds=${sessionData.figureIds.join(',')}&depth=${sessionData.depth}`;
      const eventSource = new EventSource(url);

      const results: Record<string, unknown> = {};

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'research-start':
            setStatuses((prev) =>
              prev.map((s) =>
                s.figureId === data.figureId
                  ? { ...s, figureName: data.figureName, stage: 'starting', progress: 10 }
                  : s
              )
            );
            break;

          case 'research-progress':
            setStatuses((prev) =>
              prev.map((s) =>
                s.figureId === data.figureId
                  ? { ...s, stage: data.stage, progress: Math.min(data.progress, 90) }
                  : s
              )
            );
            break;

          case 'research-complete':
            results[data.figureId] = data.result;
            setStatuses((prev) =>
              prev.map((s) =>
                s.figureId === data.figureId
                  ? { ...s, complete: true, progress: 100, stage: 'complete', result: data.result }
                  : s
              )
            );
            break;

          case 'research-error':
            setStatuses((prev) =>
              prev.map((s) =>
                s.figureId === data.figureId
                  ? { ...s, error: data.error, progress: 100 }
                  : s
              )
            );
            break;

          case 'all-complete':
            eventSource.close();

            // Store results and navigate to dinner
            const fullSession = {
              ...sessionData,
              researchResults: results,
            };
            sessionStorage.setItem(
              `dinner-session-${sessionId}`,
              JSON.stringify(fullSession)
            );
            setAllComplete(true);

            // Auto-navigate after a moment
            setTimeout(() => {
              router.push(`/dinnerparty/dinner/${sessionId}`);
            }, 2000);
            break;
        }
      };

      eventSource.onerror = () => {
        eventSource.close();

        // Fallback: try non-streaming POST
        fallbackResearch(sessionData);
      };
    } catch {
      // Fallback to non-streaming
      const stored2 = sessionStorage.getItem(`dinner-session-${sessionId}`);
      if (stored2) {
        fallbackResearch(JSON.parse(stored2));
      }
    }
  }, [sessionId, router]);

  const fallbackResearch = async (sessionData: SessionData) => {
    try {
      // Update all to "in progress"
      setStatuses((prev) =>
        prev.map((s) => ({ ...s, stage: 'quick-research', progress: 50 }))
      );

      const response = await fetch('/api/dinnerparty/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          figureIds: sessionData.figureIds,
          depth: sessionData.depth,
        }),
      });

      if (!response.ok) throw new Error('Research failed');

      const data = await response.json();

      // Store results
      const results: Record<string, unknown> = {};
      data.results.forEach((r: { figureId: string }) => {
        results[r.figureId] = r;
      });

      const fullSession = {
        ...sessionData,
        researchResults: results,
      };
      sessionStorage.setItem(
        `dinner-session-${sessionId}`,
        JSON.stringify(fullSession)
      );

      // Mark all complete
      setStatuses((prev) =>
        prev.map((s) => ({
          ...s,
          complete: true,
          progress: 100,
          stage: 'complete',
          result: results[s.figureId],
        }))
      );
      setAllComplete(true);

      setTimeout(() => {
        router.push(`/dinnerparty/dinner/${sessionId}`);
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Research failed. Please try again.'
      );
    }
  };

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
