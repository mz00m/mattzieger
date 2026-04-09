'use client';

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

function getStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    'starting': 'Preparing research materials...',
    'fetching-sources': 'Fetching primary sources...',
    'analyzing': 'Analyzing philosophical frameworks...',
    'extracting': 'Extracting core beliefs and voice patterns...',
    'synthesizing': 'Building character voice...',
    'complete': 'Ready',
    'quick-research': 'Studying writings and speeches...',
  };
  return labels[stage] || stage;
}

export default function ResearchProgress({ statuses }: ResearchProgressProps) {
  const allComplete = statuses.every((s) => s.complete);

  return (
    <div className="space-y-6">
      {/* Ambient header */}
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
            : 'Researching each guest to ensure authentic conversation'}
        </p>
      </div>

      {/* Progress rows */}
      <div className="space-y-3 max-w-lg mx-auto">
        {statuses.map((status) => (
          <div
            key={status.figureId}
            className={`rounded-lg border p-4 transition-all duration-500 ${
              status.complete
                ? 'border-dinner-gold/30 bg-dinner-gold/5'
                : status.error
                ? 'border-red-900/50 bg-red-900/10'
                : 'border-dinner-border bg-dinner-card'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-serif text-dinner-cream text-sm">
                {status.figureName}
              </span>
              {status.complete && (
                <span className="text-dinner-gold text-xs">Ready</span>
              )}
              {status.error && (
                <span className="text-red-400 text-xs">Error</span>
              )}
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-dinner-border/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${status.progress}%`,
                  background: status.complete
                    ? 'linear-gradient(90deg, #c9a96e, #e8d5a8)'
                    : status.error
                    ? '#ef4444'
                    : 'linear-gradient(90deg, #6b2d3e, #c9a96e)',
                }}
              />
            </div>

            {/* Stage label */}
            {!status.complete && !status.error && (
              <p className="text-dinner-text-dim text-xs mt-1.5 font-mono">
                {getStageLabel(status.stage)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
