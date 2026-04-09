'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FIGURES } from '@/lib/figures';
import type { HistoricalFigure, FigureCategory } from '@/lib/figures';
import { DINNER_TOPICS, type TopicCategory } from '@/lib/prompts';
import FigureCard from '@/components/FigureCard';
import FigureSearch from '@/components/FigureSearch';
import CategoryFilter from '@/components/CategoryFilter';
import TopicSelector from '@/components/TopicSelector';
import DinnerTable from '@/components/DinnerTable';
import CustomFigureCreator from '@/components/CustomFigureCreator';

const MAX_GUESTS = 5;

export default function DinnerPartyPage() {
  const router = useRouter();
  const guestSectionRef = useRef<HTMLDivElement>(null);

  // Guest selection
  const [selectedGuests, setSelectedGuests] = useState<HistoricalFigure[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FigureCategory | 'All'>('All');

  // Research depth
  const [researchDepth, setResearchDepth] = useState<'quick' | 'deep'>('quick');

  // Topic
  const [selectedTopic, setSelectedTopic] = useState<string>(DINNER_TOPICS.philosophy[0]);
  const [topicCategory, setTopicCategory] = useState<TopicCategory>('philosophy');

  // User participation
  const [userParticipating, setUserParticipating] = useState(false);
  const [userName, setUserName] = useState('');
  const [userBackground, setUserBackground] = useState('');

  // Custom figures
  const [customFigures, setCustomFigures] = useState<HistoricalFigure[]>([]);

  // UI state
  const [showTopicPanel, setShowTopicPanel] = useState(false);

  // All available figures (for DinnerTable search)
  const allFigures = useMemo(() => [...FIGURES, ...customFigures], [customFigures]);

  // Handle custom figure creation
  const handleCustomFigureCreated = useCallback((figure: HistoricalFigure) => {
    setCustomFigures((prev) => [...prev, figure]);
    setSelectedGuests((prev) => {
      if (prev.length >= MAX_GUESTS) return prev;
      return [...prev, figure];
    });
  }, []);

  // Filter figures
  const filteredFigures = useMemo(() => {
    let figures = allFigures;

    if (categoryFilter !== 'All') {
      figures = figures.filter((f) => f.category.includes(categoryFilter));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      figures = figures.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.tagline.toLowerCase().includes(query) ||
          f.knownFor.some((k) => k.toLowerCase().includes(query)) ||
          f.nationality.toLowerCase().includes(query) ||
          f.category.some((c) => c.toLowerCase().includes(query))
      );
    }

    return figures;
  }, [allFigures, categoryFilter, searchQuery]);

  const toggleGuest = useCallback(
    (figure: HistoricalFigure) => {
      setSelectedGuests((prev) => {
        const exists = prev.find((g) => g.id === figure.id);
        if (exists) {
          return prev.filter((g) => g.id !== figure.id);
        }
        if (prev.length >= MAX_GUESTS) return prev;
        return [...prev, figure];
      });
    },
    []
  );

  const addGuest = useCallback((figure: HistoricalFigure) => {
    setSelectedGuests((prev) => {
      if (prev.length >= MAX_GUESTS) return prev;
      if (prev.some((g) => g.id === figure.id)) return prev;
      return [...prev, figure];
    });
  }, []);

  const removeGuest = useCallback((figureId: string) => {
    setSelectedGuests((prev) => prev.filter((g) => g.id !== figureId));
  }, []);

  const canBegin = selectedGuests.length >= 2 && selectedTopic.trim().length > 0;

  // Step progress
  const currentStep = selectedGuests.length >= 2 ? (selectedTopic ? 3 : 2) : 1;

  const handleBeginEvening = () => {
    const sessionData = {
      id: crypto.randomUUID(),
      figureIds: selectedGuests.map((g) => g.id),
      depth: researchDepth,
      topic: selectedTopic,
      topicCategory,
      userParticipating,
      userName: userParticipating ? userName : undefined,
      userBackground: userParticipating ? userBackground : undefined,
    };

    sessionStorage.setItem(
      `dinner-session-${sessionData.id}`,
      JSON.stringify(sessionData)
    );

    router.push(`/dinnerparty/research/${sessionData.id}`);
  };

  return (
    <div className="min-h-screen bg-dinner-bg text-dinner-cream">
      {/* Header */}
      <header className="border-b border-dinner-border/50 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl text-dinner-cream tracking-tight">
                The Eternal Dinner Party
              </h1>
              <p className="text-dinner-text-dim text-xs sm:text-sm mt-1 font-body">
                Seat history&apos;s greatest minds at your table
              </p>
            </div>
            <a
              href="/"
              className="text-dinner-text-dim hover:text-dinner-cream text-xs font-mono transition-colors"
            >
              mattzieger.com
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Step guide */}
        <div className="flex items-center gap-3 sm:gap-4">
          <StepIndicator step={1} label="Choose guests" active={currentStep === 1} done={currentStep > 1} />
          <div className={`flex-1 h-px max-w-12 ${currentStep > 1 ? 'bg-dinner-terracotta/40' : 'bg-dinner-border'}`} />
          <StepIndicator step={2} label="Pick a topic" active={currentStep === 2} done={currentStep > 2} />
          <div className={`flex-1 h-px max-w-12 ${currentStep > 2 ? 'bg-dinner-terracotta/40' : 'bg-dinner-border'}`} />
          <StepIndicator step={3} label="Begin" active={currentStep === 3} done={false} />
        </div>

        {/* Selected guests tray */}
        <DinnerTable
          guests={selectedGuests}
          onRemove={removeGuest}
          onAddGuest={addGuest}
          allFigures={allFigures}
          userParticipating={userParticipating}
          userName={userName}
          maxGuests={MAX_GUESTS + (userParticipating ? 1 : 0)}
        />

        {/* Topic — always visible, inline */}
        <div className="bg-white border border-dinner-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif text-dinner-cream text-sm">
              Tonight&apos;s Topic
            </h3>
            <button
              onClick={() => setShowTopicPanel(!showTopicPanel)}
              className="text-dinner-terracotta text-xs font-body hover:underline"
            >
              {showTopicPanel ? 'Close' : 'Change topic'}
            </button>
          </div>
          <p className="text-dinner-text-secondary text-sm font-body">
            {selectedTopic}
          </p>
          {showTopicPanel && (
            <div className="mt-4 pt-4 border-t border-dinner-border/50 animate-fade-in">
              <TopicSelector
                selectedTopic={selectedTopic}
                selectedCategory={topicCategory}
                onSelect={(topic, cat) => {
                  setSelectedTopic(topic);
                  setTopicCategory(cat);
                }}
              />
            </div>
          )}
        </div>

        {/* Options row */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Research depth toggle */}
          <div className="flex items-center gap-1 bg-white border border-dinner-border rounded-lg p-1">
            <button
              onClick={() => setResearchDepth('quick')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
                researchDepth === 'quick'
                  ? 'bg-dinner-gold/15 text-dinner-gold border border-dinner-gold/30'
                  : 'text-dinner-text-secondary hover:text-dinner-cream'
              }`}
            >
              Quick
            </button>
            <button
              onClick={() => setResearchDepth('deep')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
                researchDepth === 'deep'
                  ? 'bg-dinner-gold/15 text-dinner-gold border border-dinner-gold/30'
                  : 'text-dinner-text-secondary hover:text-dinner-cream'
              }`}
            >
              Deep Research
            </button>
          </div>

          {/* User participation toggle */}
          <button
            onClick={() => setUserParticipating(!userParticipating)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-body border transition-all ${
              userParticipating
                ? 'bg-dinner-wine/15 border-dinner-wine/40 text-dinner-wine'
                : 'bg-white border-dinner-border text-dinner-text-secondary hover:border-dinner-wine/40'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
            {userParticipating ? 'Joining as guest' : 'Join the conversation'}
          </button>
        </div>

        {/* User participation form */}
        {userParticipating && (
          <div className="bg-dinner-wine/5 border border-dinner-wine/20 rounded-xl p-4 space-y-3 animate-fade-in">
            <h3 className="font-serif text-dinner-cream text-sm">
              Introduce yourself
            </h3>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-white border border-dinner-border rounded-lg px-3 py-2
                text-dinner-cream placeholder-dinner-text-dim text-sm font-body
                focus:outline-none focus:border-dinner-wine/50"
            />
            <textarea
              value={userBackground}
              onChange={(e) => setUserBackground(e.target.value)}
              placeholder="A little about yourself (e.g., 'Teacher interested in philosophy')"
              rows={2}
              className="w-full bg-white border border-dinner-border rounded-lg px-3 py-2
                text-dinner-cream placeholder-dinner-text-dim text-sm font-body resize-none
                focus:outline-none focus:border-dinner-wine/50"
            />
          </div>
        )}

        {/* Guest browsing section */}
        <div ref={guestSectionRef} className="space-y-3">
          <h3 className="font-serif text-dinner-cream text-sm">
            Browse guests
          </h3>
          <FigureSearch value={searchQuery} onChange={setSearchQuery} />
          <CategoryFilter selected={categoryFilter} onChange={setCategoryFilter} />
        </div>

        {/* Figure grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredFigures.map((figure) => (
            <FigureCard
              key={figure.id}
              figure={figure}
              selected={selectedGuests.some((g) => g.id === figure.id)}
              onToggle={toggleGuest}
              disabled={
                selectedGuests.length >= MAX_GUESTS &&
                !selectedGuests.some((g) => g.id === figure.id)
              }
            />
          ))}
        </div>

        {/* Custom figure creator */}
        <CustomFigureCreator onFigureCreated={handleCustomFigureCreated} />

        {filteredFigures.length === 0 && (
          <div className="text-center py-12">
            <p className="text-dinner-text-dim font-body">
              No figures found matching &ldquo;{searchQuery}&rdquo;
            </p>
          </div>
        )}
      </main>

      {/* Begin evening CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-dinner-border shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-dinner-text-secondary text-xs font-body">
            {selectedGuests.length < 2
              ? `Select ${2 - selectedGuests.length} more guest${2 - selectedGuests.length > 1 ? 's' : ''} to begin`
              : `${selectedGuests.length} guest${selectedGuests.length > 1 ? 's' : ''} ready`}
          </div>
          <button
            onClick={handleBeginEvening}
            disabled={!canBegin}
            className={`px-6 py-2.5 rounded-lg font-serif text-sm transition-all ${
              canBegin
                ? 'bg-dinner-terracotta text-white hover:bg-dinner-terracotta/90 shadow-md shadow-dinner-terracotta/20'
                : 'bg-dinner-card border border-dinner-border text-dinner-text-dim cursor-not-allowed'
            }`}
          >
            Begin the Evening
          </button>
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ step, label, active, done }: { step: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono shrink-0 transition-all ${
          done
            ? 'bg-dinner-terracotta/15 text-dinner-terracotta border border-dinner-terracotta/30'
            : active
            ? 'bg-dinner-terracotta text-white'
            : 'bg-dinner-card text-dinner-text-dim border border-dinner-border'
        }`}
      >
        {done ? (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          step
        )}
      </div>
      <span className={`text-xs font-body hidden sm:inline ${
        active ? 'text-dinner-cream' : done ? 'text-dinner-terracotta' : 'text-dinner-text-dim'
      }`}>
        {label}
      </span>
    </div>
  );
}
