'use client';

import { useState } from 'react';
import type { HistoricalFigure } from '@/lib/figures';

interface CustomFigureCreatorProps {
  onFigureCreated: (figure: HistoricalFigure) => void;
}

export default function CustomFigureCreator({
  onFigureCreated,
}: CustomFigureCreatorProps) {
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || isCreating) return;

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/dinnerparty/figures/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create figure');
      }

      const data = await response.json();
      onFigureCreated(data.figure);
      setName('');
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full border-2 border-dashed border-dinner-border/50 rounded-lg p-4
          text-dinner-text-dim hover:text-dinner-gold-light hover:border-dinner-gold/30
          transition-all text-sm font-body flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Can&apos;t find who you&apos;re looking for? Add a custom guest
      </button>
    );
  }

  return (
    <div className="border border-dinner-gold/20 bg-dinner-gold/5 rounded-lg p-4 space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-dinner-gold text-sm">
          Add a custom guest
        </h3>
        <button
          onClick={() => {
            setIsOpen(false);
            setError(null);
          }}
          className="text-dinner-text-dim hover:text-dinner-cream"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <p className="text-dinner-text-secondary text-xs font-body">
        Enter any historical, cultural, or public figure. Our AI will research
        them and create a character profile that other users can also use.
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="e.g., Hypatia of Alexandria, Frida Kahlo, Noam Chomsky..."
          className="flex-1 bg-dinner-card border border-dinner-border rounded-lg px-3 py-2
            text-dinner-cream placeholder-dinner-text-dim text-sm font-body
            focus:outline-none focus:border-dinner-gold/50"
          disabled={isCreating}
        />
        <button
          onClick={handleCreate}
          disabled={!name.trim() || isCreating}
          className={`px-4 py-2 rounded-lg text-xs font-mono transition-all ${
            isCreating
              ? 'bg-dinner-gold/10 border border-dinner-gold/20 text-dinner-gold/50 cursor-wait'
              : name.trim()
              ? 'bg-dinner-gold/20 border border-dinner-gold text-dinner-gold-light hover:bg-dinner-gold/30'
              : 'bg-dinner-card border border-dinner-border text-dinner-text-dim cursor-not-allowed'
          }`}
        >
          {isCreating ? (
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 border-2 border-dinner-gold/30 border-t-dinner-gold rounded-full animate-spin" />
              Researching...
            </span>
          ) : (
            'Create'
          )}
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-xs">{error}</p>
      )}

      {isCreating && (
        <p className="text-dinner-text-dim text-xs font-body italic animate-pulse">
          Our AI is researching this person and building their character profile.
          This will be available to all future dinner party hosts.
        </p>
      )}
    </div>
  );
}
