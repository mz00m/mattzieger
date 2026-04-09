'use client';

interface FigureSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function FigureSearch({ value, onChange }: FigureSearchProps) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg
          className="w-4 h-4 text-dinner-text-dim"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search figures by name, topic, or era..."
        className="w-full bg-dinner-card border border-dinner-border rounded-lg pl-10 pr-4 py-3
          text-dinner-cream placeholder-dinner-text-dim text-sm font-body
          focus:outline-none focus:border-dinner-gold/50 focus:ring-1 focus:ring-dinner-gold/20
          transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-dinner-text-dim hover:text-dinner-cream transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
