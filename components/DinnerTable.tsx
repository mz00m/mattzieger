'use client';

import type { HistoricalFigure } from '@/lib/figures';

interface DinnerTableProps {
  guests: HistoricalFigure[];
  onRemove: (figureId: string) => void;
  userParticipating: boolean;
  userName?: string;
  maxGuests: number;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function DinnerTable({
  guests,
  onRemove,
  userParticipating,
  userName,
  maxGuests,
}: DinnerTableProps) {
  const emptySeats = maxGuests - guests.length - (userParticipating ? 1 : 0);

  return (
    <div className="bg-dinner-card/50 border border-dinner-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-serif text-dinner-gold text-sm">
          Tonight&apos;s Guests
        </h3>
        <span className="text-dinner-text-dim text-xs font-mono">
          {guests.length + (userParticipating ? 1 : 0)}/{maxGuests} seats
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* User seat */}
        {userParticipating && (
          <div className="flex items-center gap-2 bg-dinner-wine/20 border border-dinner-wine/40 rounded-full px-3 py-1.5">
            <div className="w-6 h-6 rounded-full bg-dinner-wine/30 border border-dinner-wine flex items-center justify-center text-[10px] text-dinner-gold-light font-serif">
              You
            </div>
            <span className="text-dinner-gold-light text-xs font-serif">
              {userName || 'You'}
            </span>
          </div>
        )}

        {/* Guest seats */}
        {guests.map((guest) => (
          <div
            key={guest.id}
            className="flex items-center gap-2 bg-dinner-gold/5 border border-dinner-gold/20 rounded-full px-3 py-1.5 group"
          >
            <div className="w-6 h-6 rounded-full bg-dinner-gold/10 border border-dinner-gold/30 flex items-center justify-center text-[10px] text-dinner-gold font-serif">
              {getInitials(guest.name)}
            </div>
            <span className="text-dinner-cream text-xs font-serif">
              {guest.name}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(guest.id);
              }}
              className="text-dinner-text-dim hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 -mr-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        {/* Empty seats */}
        {Array.from({ length: Math.max(0, emptySeats) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex items-center gap-2 border border-dashed border-dinner-border/50 rounded-full px-3 py-1.5"
          >
            <div className="w-6 h-6 rounded-full border border-dashed border-dinner-border/50 flex items-center justify-center text-[10px] text-dinner-text-dim">
              +
            </div>
            <span className="text-dinner-text-dim text-xs font-mono">
              Empty seat
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
