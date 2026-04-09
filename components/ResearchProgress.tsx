'use client';

import { useState, useEffect, useRef } from 'react';

interface ResearchStatus {
  figureId: string;
  figureName: string;
  stage: string;
  progress: number;
  complete: boolean;
  error?: string;
}

interface ResearchProgressProps {
  statuses: ResearchStatus[];
}

// Rotating flavor messages per research stage — keeps the UI alive
const ACTIVITY_MESSAGES = [
  'Reading their letters and writings...',
  'Studying their speeches...',
  'Learning their mannerisms...',
  'Tracing their intellectual journey...',
  'Cataloging their famous quotes...',
  'Mapping their relationships...',
  'Understanding their worldview...',
  'Capturing their voice patterns...',
  'Noting their contradictions...',
  'Building their personality profile...',
  'Reviewing their debates and disputes...',
  'Absorbing their philosophy...',
];

function useRotatingMessage(active: boolean, intervalMs = 3000): string {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ACTIVITY_MESSAGES.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [active, intervalMs]);

  return ACTIVITY_MESSAGES[index];
}

// Smoothly animate progress between jumps
function useSmoothedProgress(target: number, complete: boolean): number {
  const [display, setDisplay] = useState(target);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (complete) {
      setDisplay(100);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    // Clear any existing interval
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Gradually creep toward target (and slightly past for liveliness)
    const ceiling = Math.min(target + 15, 95); // never fake-complete
    intervalRef.current = setInterval(() => {
      setDisplay((prev) => {
        if (prev >= ceiling) return prev;
        // Slow down as we approach the ceiling
        const remaining = ceiling - prev;
        const step = Math.max(0.3, remaining * 0.08);
        return Math.min(prev + step, ceiling);
      });
    }, 200);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [target, complete]);

  return Math.round(display);
}

function ResearchCard({ status }: { status: ResearchStatus }) {
  const isActive = !status.complete && !status.error;
  const rotatingMsg = useRotatingMessage(isActive);
  const smoothProgress = useSmoothedProgress(status.progress, status.complete);

  return (
    <div
      className={`rounded-lg border p-4 transition-all duration-500 ${
        status.complete
          ? 'border-dinner-gold/30 bg-dinner-gold/5'
          : status.error
          ? 'border-red-900/50 bg-red-900/10'
          : 'border-dinner-border bg-dinner-card'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Pulsing dot for active research */}
          {isActive && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-dinner-candle opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-dinner-candle" />
            </span>
          )}
          <span className="font-serif text-dinner-cream text-sm">
            {status.figureName}
          </span>
        </div>
        {status.complete && !status.error && (
          <span className="text-dinner-gold text-xs font-serif">Arrived</span>
        )}
        {status.error && (
          <span className="text-red-600 text-xs">Error</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-dinner-border/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${
            isActive ? 'animate-shimmer' : ''
          }`}
          style={{
            width: `${smoothProgress}%`,
            background: status.complete
              ? 'linear-gradient(90deg, #9A7B56, #C4A87A)'
              : status.error
              ? '#ef4444'
              : 'linear-gradient(90deg, #8B3A4A, #C4A87A, #8B3A4A)',
            backgroundSize: isActive ? '200% 100%' : '100% 100%',
          }}
        />
      </div>

      {/* Activity message */}
      {isActive && (
        <p className="text-dinner-text-dim text-xs mt-1.5 font-body transition-opacity duration-500">
          {rotatingMsg}
        </p>
      )}
    </div>
  );
}

export default function ResearchProgress({ statuses }: ResearchProgressProps) {
  const completed = statuses.filter((s) => s.complete && !s.error).length;
  const total = statuses.length;
  const allComplete = total > 0 && statuses.every((s) => s.complete);

  // Overall elapsed time
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (allComplete || total === 0) return;
    const timer = setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => clearInterval(timer);
  }, [allComplete, total]);

  const formatTime = (secs: number) => {
    if (secs < 60) return `${secs}s`;
    return `${Math.floor(secs / 60)}m ${secs % 60}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-dinner-candle animate-candle-flicker"
              style={{ animationDelay: `${i * 0.5}s` }}
            />
          ))}
        </div>
        <h2 className="font-serif text-dinner-gold-light text-xl">
          {allComplete ? 'Your guests have arrived' : 'Preparing the evening...'}
        </h2>
        <p className="text-dinner-text-dim text-sm font-body">
          {allComplete
            ? 'The table is set. The candles are lit.'
            : `Researching each guest for authentic conversation`}
        </p>
        {/* Progress counter + timer */}
        {!allComplete && total > 0 && (
          <p className="text-dinner-text-dim/60 text-xs font-mono">
            {completed}/{total} guests ready &middot; {formatTime(elapsed)}
          </p>
        )}
      </div>

      {/* Progress rows */}
      <div className="space-y-3 max-w-lg mx-auto">
        {statuses.map((status) => (
          <ResearchCard key={status.figureId} status={status} />
        ))}
      </div>
    </div>
  );
}
