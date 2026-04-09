'use client';

import { useState, useMemo, useCallback } from 'react';
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

  // Handle custom figure creation
  const handleCustomFigureCreated = useCallback((figure: HistoricalFigure) => {
    setCustomFigures((prev) => [...prev, figure]);
    // Auto-select the custom figure
    setSelectedGuests((prev) => {
      if (prev.length >= MAX_GUESTS) return prev;
      return [...prev, figure];
    });
  }, []);

  // Filter figures
  const filteredFigures = useMemo(() => {
    let figures = [...FIGURES, ...customFigures];

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
  }, [categoryFilter, searchQuery]);

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

  const removeGuest = useCallback((figureId: string) => {
    setSelectedGuests((prev) => prev.filter((g) => g.id !== figureId));
  }, []);

  const canBegin = selectedGuests.length >= 2 && selectedTopic.trim().length > 0;

  const handleBeginEvening = () => {
    // Create session and navigate to research phase
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

    // Store session in sessionStorage for the research page to pick up
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
        {/* Selected guests tray */}
        <DinnerTable
          guests={selectedGuests}
          onRemove={removeGuest}
          userParticipating={userParticipating}
          userName={userName}
          maxGuests={MAX_GUESTS + (userParticipating ? 1 : 0)}
        />

        {/* Controls row */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Research depth toggle */}
          <div className="flex items-center gap-2 bg-dinner-card border border-dinner-border rounded-lg p-1">
            <button
              onClick={() => setResearchDepth('quick')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
                researchDepth === 'quick'
                  ? 'bg-dinner-gold/20 text-dinner-gold border border-dinner-gold/30'
                  : 'text-dinner-text-secondary hover:text-dinner-cream'
              }`}
            >
              Quick Brief
            </button>
            <button
              onClick={() => setResearchDepth('deep')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
                researchDepth === 'deep'
                  ? 'bg-dinner-gold/20 text-dinner-gold border border-dinner-gold/30'
                  : 'text-dinner-text-secondary hover:text-dinner-cream'
              }`}
            >
              Deep Research
            </button>
          </div>

          {/* User participation toggle */}
          <button
            onClick={() => setUserParticipating(!userParticipating)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono border transition-all ${
              userParticipating
                ? 'bg-dinner-wine/20 border-dinner-wine text-dinner-gold-light'
                : 'bg-dinner-card border-dinner-border text-dinner-text-secondary hover:border-dinner-wine/40'
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
            {userParticipating ? 'Joining as guest' : 'Join as guest'}
          </button>

          {/* Topic selector toggle */}
          <button
            onClick={() => setShowTopicPanel(!showTopicPanel)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono border transition-all ${
              showTopicPanel
                ? 'bg-dinner-wine/20 border-dinner-wine text-dinner-gold-light'
                : 'bg-dinner-card border-dinner-border text-dinner-text-secondary hover:border-dinner-wine/40'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Topic: {selectedTopic.slice(0, 30)}{selectedTopic.length > 30 ? '...' : ''}
          </button>
        </div>

        {/* User participation form */}
        {userParticipating && (
          <div className="bg-dinner-wine/5 border border-dinner-wine/20 rounded-lg p-4 space-y-3 animate-fade-in">
            <h3 className="font-serif text-dinner-gold-light text-sm">
              Introduce yourself to the table
            </h3>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-dinner-card border border-dinner-border rounded-lg px-3 py-2
                text-dinner-cream placeholder-dinner-text-dim text-sm font-body
                focus:outline-none focus:border-dinner-wine/50"
            />
            <textarea
              value={userBackground}
              onChange={(e) => setUserBackground(e.target.value)}
              placeholder="Tell the table a little about yourself (e.g., 'I'm a teacher in 2025 interested in philosophy')"
              rows={2}
              className="w-full bg-dinner-card border border-dinner-border rounded-lg px-3 py-2
                text-dinner-cream placeholder-dinner-text-dim text-sm font-body resize-none
                focus:outline-none focus:border-dinner-wine/50"
            />
          </div>
        )}

        {/* Topic selector panel */}
        {showTopicPanel && (
          <div className="bg-dinner-card/50 border border-dinner-border rounded-lg p-4 animate-fade-in">
            <h3 className="font-serif text-dinner-gold-light text-sm mb-3">
              Set the evening&apos;s topic
            </h3>
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

        {/* Search and filters */}
        <div className="space-y-3">
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
          <div className="text-dinner-text-dim text-xs font-mono">
            {selectedGuests.length < 2
              ? `Select ${2 - selectedGuests.length} more guest${2 - selectedGuests.length > 1 ? 's' : ''} to begin`
              : `${selectedGuests.length} guests selected`}
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
