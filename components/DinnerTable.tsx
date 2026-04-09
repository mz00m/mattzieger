'use client';

import { useState, useRef, useEffect } from 'react';
import type { HistoricalFigure } from '@/lib/figures';

interface DinnerTableProps {
  guests: HistoricalFigure[];
  onRemove: (figureId: string) => void;
  onAddGuest?: (figure: HistoricalFigure) => void;
  allFigures?: HistoricalFigure[];
  userParticipating: boolean;
  userName?: string;
  maxGuests: number;
}

// Pick figures spread across different categories so the default list isn't all philosophy
function spreadByCategory(figures: HistoricalFigure[], count: number): HistoricalFigure[] {
  const byCategory = new Map<string, HistoricalFigure[]>();
  for (const f of figures) {
    const cat = f.category[0] || 'Other';
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(f);
  }
  const result: HistoricalFigure[] = [];
  const seen = new Set<string>();
  const categories = Array.from(byCategory.keys());
  let round = 0;
  while (result.length < count && round < 20) {
    for (const cat of categories) {
      const pool = byCategory.get(cat)!;
      if (round < pool.length && !seen.has(pool[round].id)) {
        result.push(pool[round]);
        seen.add(pool[round].id);
        if (result.length >= count) break;
      }
    }
    round++;
  }
  return result;
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

function GuestSearchPopover({
  allFigures,
  selectedIds,
  onSelect,
  onClose,
}: {
  allFigures: HistoricalFigure[];
  selectedIds: Set<string>;
  onSelect: (figure: HistoricalFigure) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const filtered = query.trim()
    ? allFigures.filter((f) => {
        if (selectedIds.has(f.id)) return false;
        const q = query.toLowerCase();
        return (
          f.name.toLowerCase().includes(q) ||
          f.category.some((c) => c.toLowerCase().includes(q)) ||
          f.nationality.toLowerCase().includes(q)
        );
      })
    : spreadByCategory(allFigures.filter((f) => !selectedIds.has(f.id)), 8);

  return (
    <div
      ref={popoverRef}
      className="absolute top-full left-0 right-0 sm:left-auto sm:right-auto sm:w-80 mt-2 bg-white border border-dinner-border rounded-xl shadow-xl z-30 overflow-hidden animate-fade-in"
    >
      <div className="p-3 border-b border-dinner-border/50">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dinner-text-dim"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, category..."
            className="w-full bg-dinner-bg border border-dinner-border rounded-lg pl-9 pr-3 py-2
              text-dinner-cream placeholder-dinner-text-dim text-sm font-body
              focus:outline-none focus:border-dinner-gold/50"
          />
        </div>
      </div>
      <div className="max-h-64 overflow-y-auto dinner-scroll">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-dinner-text-dim text-xs font-body">
            {query ? 'No matching figures found' : 'All figures are already seated'}
          </div>
        ) : (
          filtered.slice(0, 12).map((figure) => (
            <button
              key={figure.id}
              onClick={() => {
                onSelect(figure);
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-dinner-bg/80 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-dinner-bg border border-dinner-border flex items-center justify-center text-xs font-serif text-dinner-text-secondary shrink-0">
                {getInitials(figure.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-dinner-cream text-sm font-serif truncate">
                  {figure.name}
                </div>
                <div className="text-dinner-text-dim text-[10px] font-mono truncate">
                  {figure.category[0]} · {figure.nationality}
                </div>
              </div>
              <svg className="w-4 h-4 text-dinner-text-dim shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default function DinnerTable({
  guests,
  onRemove,
  onAddGuest,
  allFigures,
  userParticipating,
  userName,
  maxGuests,
}: DinnerTableProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const emptySeats = maxGuests - guests.length - (userParticipating ? 1 : 0);
  const selectedIds = new Set(guests.map((g) => g.id));
  const canAdd = !!(onAddGuest && allFigures && emptySeats > 0);

  return (
    <div className="bg-white border border-dinner-border rounded-xl p-4 shadow-sm relative">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-serif text-dinner-cream text-sm">
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

        {/* Empty seats — clickable to search & add */}
        {Array.from({ length: Math.max(0, emptySeats) }).map((_, i) => (
          <button
            key={`empty-${i}`}
            onClick={() => canAdd && setSearchOpen(true)}
            disabled={!canAdd}
            className={`flex items-center gap-2 border border-dashed rounded-full px-3 py-1.5 transition-all
              ${canAdd
                ? 'border-dinner-terracotta/40 hover:border-dinner-terracotta hover:bg-dinner-terracotta/5 cursor-pointer group'
                : 'border-dinner-border/50 cursor-default'
              }`}
          >
            <div className={`w-6 h-6 rounded-full border border-dashed flex items-center justify-center text-[10px] transition-colors
              ${canAdd
                ? 'border-dinner-terracotta/40 text-dinner-terracotta group-hover:border-dinner-terracotta group-hover:bg-dinner-terracotta/10'
                : 'border-dinner-border/50 text-dinner-text-dim'
              }`}>
              +
            </div>
            <span className={`text-xs font-body transition-colors
              ${canAdd ? 'text-dinner-text-secondary group-hover:text-dinner-terracotta' : 'text-dinner-text-dim'}`}>
              Add guest
            </span>
          </button>
        ))}
      </div>

      {/* Search popover */}
      {searchOpen && canAdd && (
        <GuestSearchPopover
          allFigures={allFigures!}
          selectedIds={selectedIds}
          onSelect={(figure) => {
            onAddGuest!(figure);
            if (emptySeats <= 1) setSearchOpen(false);
          }}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </div>
  );
}
