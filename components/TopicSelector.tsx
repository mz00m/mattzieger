'use client';

import { useState } from 'react';
import { DINNER_TOPICS, type TopicCategory } from '@/lib/prompts';

interface TopicSelectorProps {
  selectedTopic: string;
  selectedCategory: TopicCategory;
  onSelect: (topic: string, category: TopicCategory) => void;
}

const CATEGORY_LABELS: Record<TopicCategory, string> = {
  philosophy: 'Philosophy',
  science: 'Science',
  society: 'Society',
  current_events: 'Current Events',
  open: 'Open',
};

export default function TopicSelector({
  selectedTopic,
  selectedCategory,
  onSelect,
}: TopicSelectorProps) {
  const [customTopic, setCustomTopic] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 dinner-scroll">
        {(Object.keys(DINNER_TOPICS) as TopicCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setShowCustom(false);
              onSelect(DINNER_TOPICS[cat][0], cat);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-all
              ${
                selectedCategory === cat && !showCustom
                  ? 'bg-dinner-wine/40 text-dinner-gold-light border border-dinner-wine'
                  : 'bg-dinner-card text-dinner-text-secondary border border-dinner-border hover:border-dinner-wine/50'
              }
            `}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
        <button
          onClick={() => setShowCustom(true)}
          className={`px-3 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-all
            ${
              showCustom
                ? 'bg-dinner-wine/40 text-dinner-gold-light border border-dinner-wine'
                : 'bg-dinner-card text-dinner-text-secondary border border-dinner-border hover:border-dinner-wine/50'
            }
          `}
        >
          Custom Topic
        </button>
      </div>

      {/* Topic list or custom input */}
      {showCustom ? (
        <div className="space-y-2">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => {
              setCustomTopic(e.target.value);
              onSelect(e.target.value, 'open');
            }}
            placeholder="What should the table discuss tonight?"
            className="w-full bg-dinner-card border border-dinner-border rounded-lg px-4 py-3
              text-dinner-cream placeholder-dinner-text-dim text-sm font-body
              focus:outline-none focus:border-dinner-wine/50 focus:ring-1 focus:ring-dinner-wine/20"
          />
        </div>
      ) : (
        <div className="grid gap-2">
          {DINNER_TOPICS[selectedCategory].map((topic) => (
            <button
              key={topic}
              onClick={() => onSelect(topic, selectedCategory)}
              className={`text-left px-4 py-3 rounded-lg border transition-all text-sm font-body
                ${
                  selectedTopic === topic
                    ? 'border-dinner-wine bg-dinner-wine/15 text-dinner-cream'
                    : 'border-dinner-border bg-dinner-card/50 text-dinner-text-secondary hover:border-dinner-wine/40 hover:text-dinner-cream'
                }
              `}
            >
              {topic}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
