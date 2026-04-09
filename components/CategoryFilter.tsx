'use client';

import type { FigureCategory } from '@/lib/figures';

const CATEGORIES: (FigureCategory | 'All')[] = [
  'All',
  'Philosophy',
  'Science',
  'Literature',
  'Music',
  'Comedy',
  'Politics',
  'Civil Rights',
  'Art',
  'Technology',
  'Film & Theater',
  'Modern Thinkers',
  'Economics',
  'Religion & Mysticism',
  'Exploration',
];

interface CategoryFilterProps {
  selected: FigureCategory | 'All';
  onChange: (category: FigureCategory | 'All') => void;
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 dinner-scroll">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-3 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-all duration-200
            ${
              selected === cat
                ? 'bg-dinner-gold/20 text-dinner-gold border border-dinner-gold/40'
                : 'bg-dinner-card text-dinner-text-secondary border border-dinner-border hover:border-dinner-gold/30 hover:text-dinner-gold-light'
            }
          `}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
