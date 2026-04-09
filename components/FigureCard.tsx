'use client';

import { useState } from 'react';
import type { HistoricalFigure } from '@/lib/figures';

interface FigureCardProps {
  figure: HistoricalFigure;
  selected: boolean;
  onToggle: (figure: HistoricalFigure) => void;
  disabled?: boolean;
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

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Philosophy: 'bg-purple-50 text-purple-700 border-purple-200',
    Science: 'bg-blue-50 text-blue-700 border-blue-200',
    Literature: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Politics: 'bg-red-50 text-red-700 border-red-200',
    'Civil Rights': 'bg-amber-50 text-amber-700 border-amber-200',
    Comedy: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    Music: 'bg-pink-50 text-pink-700 border-pink-200',
    Art: 'bg-orange-50 text-orange-700 border-orange-200',
    Technology: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    Economics: 'bg-lime-50 text-lime-700 border-lime-200',
    'Religion & Mysticism': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Exploration: 'bg-teal-50 text-teal-700 border-teal-200',
    'Film & Theater': 'bg-rose-50 text-rose-700 border-rose-200',
    'Modern Thinkers': 'bg-violet-50 text-violet-700 border-violet-200',
  };
  return colors[category] || 'bg-gray-50 text-gray-700 border-gray-200';
}

export default function FigureCard({
  figure,
  selected,
  onToggle,
  disabled,
}: FigureCardProps) {
  const [expanded, setExpanded] = useState(false);

  const era = figure.died
    ? `${figure.born} – ${figure.died}`
    : `${figure.born} – present`;

  return (
    <div
      className={`relative rounded-lg border transition-all duration-300 cursor-pointer group
        ${
          selected
            ? 'border-dinner-gold bg-dinner-gold/5 shadow-md shadow-dinner-gold/10'
            : 'border-dinner-border bg-dinner-card hover:border-dinner-gold/50 hover:shadow-md'
        }
        ${disabled && !selected ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onClick={() => !disabled || selected ? onToggle(figure) : null}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Selection indicator */}
      {selected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-dinner-gold rounded-full flex items-center justify-center text-white text-xs font-bold z-10">
          ✓
        </div>
      )}

      <div className="p-4">
        {/* Avatar + Name */}
        <div className="flex items-start gap-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-serif shrink-0
              ${
                selected
                  ? 'bg-dinner-gold/20 text-dinner-gold border border-dinner-gold/40'
                  : 'bg-dinner-border/50 text-dinner-text-secondary border border-dinner-border'
              }
            `}
          >
            {getInitials(figure.name)}
          </div>
          <div className="min-w-0">
            <h3 className="font-serif font-semibold text-dinner-cream text-base leading-tight">
              {figure.name}
            </h3>
            <p className="text-dinner-text-dim text-xs mt-0.5 font-mono">
              {era} · {figure.nationality}
            </p>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-dinner-text-secondary text-sm mt-3 leading-relaxed font-body italic">
          &ldquo;{figure.tagline}&rdquo;
        </p>

        {/* Category chips */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {figure.category.map((cat) => (
            <span
              key={cat}
              className={`text-[10px] px-2 py-0.5 rounded-full border ${getCategoryColor(cat)}`}
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Expanded info on hover */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-dinner-border/50 animate-fade-in">
            <p className="text-[10px] uppercase tracking-wider text-dinner-text-dim mb-1.5">
              Known for
            </p>
            <ul className="space-y-1">
              {figure.knownFor.slice(0, 4).map((fact, i) => (
                <li
                  key={i}
                  className="text-dinner-text-secondary text-xs flex items-start gap-1.5"
                >
                  <span className="text-dinner-gold/60 mt-0.5">·</span>
                  {fact}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
