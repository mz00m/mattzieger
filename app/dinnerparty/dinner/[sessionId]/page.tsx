'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ConversationPlayer from '@/components/ConversationPlayer';
import UserMicInput from '@/components/UserMicInput';
import TopicSelector from '@/components/TopicSelector';
import type { DinnerSession, ConversationExchange } from '@/lib/conversationOrchestrator';
import type { CharacterKnowledgeBase } from '@/lib/researchAgent';
import type { TopicCategory } from '@/lib/prompts';

export default function DinnerPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<DinnerSession | null>(null);
  const [exchanges, setExchanges] = useState<ConversationExchange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(0.8);
  const [currentExchangeIndex, setCurrentExchangeIndex] = useState(0);
  const [listeningMode, setListeningMode] = useState(false);

  // User interaction
  const [awaitingUserInput, setAwaitingUserInput] = useState(false);
  const [userQuestionPrompt, setUserQuestionPrompt] = useState('');
  const [userQuestionSpeaker, setUserQuestionSpeaker] = useState('');

  // Topic change
  const [showTopicChanger, setShowTopicChanger] = useState(false);

  const hasInitialized = useRef(false);

  // Load session data
  useEffect(() => {
    const stored = sessionStorage.getItem(`dinner-session-${sessionId}`);
    if (!stored) {
      setError('Session not found.');
      setIsLoading(false);
      return;
    }

    const data = JSON.parse(stored);
    const researchResults: CharacterKnowledgeBase[] = Object.values(
      data.researchResults || {}
    ) as CharacterKnowledgeBase[];

    const dinnerSession: DinnerSession = {
      id: sessionId,
      topic: data.topic,
      topicCategory: data.topicCategory || 'open',
      guests: researchResults,
      userParticipating: data.userParticipating || false,
      userName: data.userName,
      userBackground: data.userBackground,
      exchanges: [],
      roundNumber: 0,
    };

    setSession(dinnerSession);
    setIsLoading(false);
  }, [sessionId]);

  // Start conversation
  const generateRound = useCallback(
    async (
      action: 'start' | 'continue' | 'user-spoke',
      userInput?: string,
      sessionOverrides?: Partial<DinnerSession>
    ) => {
      if (!session || isGenerating) return;

      setIsGenerating(true);
      setAwaitingUserInput(false);

      try {
        const currentSession: DinnerSession = {
          ...session,
          ...sessionOverrides,
          exchanges,
          roundNumber: session.roundNumber + (action === 'start' ? 0 : 1),
        };

        const response = await fetch('/api/dinnerparty/conversation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session: currentSession,
            action,
            userInput,
          }),
        });

        if (!response.ok) throw new Error('Failed to generate conversation');

        const data = await response.json();
        const newExchanges: ConversationExchange[] = data.exchanges || [];

        setExchanges((prev) => [...prev, ...newExchanges]);
        setSession((prev) =>
          prev ? { ...prev, roundNumber: prev.roundNumber + 1 } : null
        );

        // Check if any exchange is a user-question
        const userQuestion = newExchanges.find(
          (e) => e.type === 'user-question'
        );
        if (userQuestion && session.userParticipating) {
          setAwaitingUserInput(true);
          setUserQuestionPrompt(userQuestion.text);
          setUserQuestionSpeaker(
            userQuestion.speaker
              ? userQuestion.speaker
                  .replace(/-/g, ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase())
              : 'A guest'
          );
        }

        // Auto-play new exchanges
        if (!isPlaying) {
          setCurrentExchangeIndex(exchanges.length);
          setIsPlaying(true);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to generate conversation'
        );
      } finally {
        setIsGenerating(false);
      }
    },
    [session, exchanges, isGenerating, isPlaying]
  );

  // Start conversation on first load
  useEffect(() => {
    if (session && !hasInitialized.current && exchanges.length === 0) {
      hasInitialized.current = true;
      generateRound('start');
    }
  }, [session, exchanges.length, generateRound]);

  // Handle user speech input
  const handleUserSpoke = (transcript: string) => {
    // Add user's exchange to the conversation
    const userExchange: ConversationExchange = {
      id: crypto.randomUUID(),
      type: 'user-turn',
      speaker: 'user',
      text: transcript,
    };
    setExchanges((prev) => [...prev, userExchange]);
    generateRound('user-spoke', transcript);
  };

  // Change topic mid-dinner
  const handleTopicChange = (newTopic: string, category: TopicCategory) => {
    if (!session) return;
    const mappedCategory = category === 'current_events' ? 'current-events' as const : category;
    setSession((prev) =>
      prev ? { ...prev, topic: newTopic, topicCategory: mappedCategory } : null
    );
    setShowTopicChanger(false);
    generateRound('continue', undefined, { topic: newTopic, topicCategory: mappedCategory });
  };

  // Export transcript
  const exportTranscript = () => {
    const lines = exchanges.map((e) => {
      if (e.type === 'narration') return `\n[${e.text}]\n`;
      const name =
        e.speaker === 'user'
          ? session?.userName || 'You'
          : e.speaker
          ? e.speaker
              .replace(/-/g, ' ')
              .replace(/\b\w/g, (l) => l.toUpperCase())
          : 'Unknown';
      return `${name}: ${e.text}`;
    });

    const transcript = [
      `THE ETERNAL DINNER PARTY`,
      `Topic: ${session?.topic}`,
      `Date: ${new Date().toLocaleDateString()}`,
      `Guests: ${session?.guests.map((g) => g.figureId.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())).join(', ')}`,
      ``,
      `---`,
      ``,
      ...lines,
    ].join('\n');

    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dinner-party-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dinner-bg flex items-center justify-center">
        <div className="text-dinner-text-dim font-body animate-pulse">
          Setting the table...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dinner-bg flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-red-600 font-body">{error}</p>
          <button
            onClick={() => router.push('/dinnerparty')}
            className="px-4 py-2 bg-dinner-card border border-dinner-border rounded-lg text-dinner-cream text-sm font-serif"
          >
            Start over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dinner-bg text-dinner-cream flex flex-col">
      {/* Header */}
      <header className="border-b border-dinner-border/50 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-dinner-cream text-lg">
              The Eternal Dinner Party
            </h1>
            <p className="text-dinner-text-dim text-xs font-body truncate max-w-[200px] sm:max-w-none">
              {session?.topic}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Listening mode toggle */}
            <button
              onClick={() => setListeningMode(!listeningMode)}
              className={`p-2 rounded-lg border text-xs transition-all ${
                listeningMode
                  ? 'bg-dinner-wine/20 border-dinner-wine text-dinner-gold-light'
                  : 'border-dinner-border text-dinner-text-secondary hover:border-dinner-wine/40'
              }`}
              title={listeningMode ? 'Reading mode' : 'Listening mode'}
            >
              {listeningMode ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>

            {/* More options */}
            <div className="relative group">
              <button className="p-2 rounded-lg border border-dinner-border text-dinner-text-secondary hover:border-dinner-gold/30 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              <div className="absolute right-0 top-full mt-1 bg-white border border-dinner-border rounded-lg shadow-lg
                opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all min-w-[180px] z-30">
                <button
                  onClick={() => setShowTopicChanger(!showTopicChanger)}
                  className="w-full text-left px-4 py-2 text-xs text-dinner-text-secondary hover:text-dinner-cream hover:bg-dinner-border/30 transition-colors"
                >
                  Change topic
                </button>
                <button
                  onClick={exportTranscript}
                  className="w-full text-left px-4 py-2 text-xs text-dinner-text-secondary hover:text-dinner-cream hover:bg-dinner-border/30 transition-colors"
                >
                  Export transcript
                </button>
                <button
                  onClick={() => router.push('/dinnerparty')}
                  className="w-full text-left px-4 py-2 text-xs text-dinner-text-secondary hover:text-dinner-cream hover:bg-dinner-border/30 transition-colors"
                >
                  New dinner party
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Topic changer */}
      {showTopicChanger && (
        <div className="border-b border-dinner-border bg-dinner-card/50 p-4 animate-fade-in">
          <div className="max-w-3xl mx-auto">
            <TopicSelector
              selectedTopic={session?.topic || ''}
              selectedCategory={(session?.topicCategory as TopicCategory) || 'open'}
              onSelect={handleTopicChange}
            />
          </div>
        </div>
      )}

      {/* Main conversation area */}
      <div className="flex-1 max-w-3xl mx-auto w-full py-4">
        {exchanges.length === 0 && isGenerating ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-3">
              <div className="flex justify-center gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-dinner-candle animate-candle-flicker"
                    style={{ animationDelay: `${i * 0.4}s` }}
                  />
                ))}
              </div>
              <p className="text-dinner-text-dim font-body text-sm animate-pulse">
                The guests are taking their seats...
              </p>
            </div>
          </div>
        ) : (
          <ConversationPlayer
            exchanges={exchanges}
            guests={session?.guests || []}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            playbackSpeed={playbackSpeed}
            onSpeedChange={setPlaybackSpeed}
            volume={volume}
            onVolumeChange={setVolume}
            currentExchangeIndex={currentExchangeIndex}
            onExchangeChange={setCurrentExchangeIndex}
            listeningMode={listeningMode}
          />
        )}

        {/* User input area */}
        {awaitingUserInput && session?.userParticipating && (
          <div className="px-4 mt-4 mb-24">
            <UserMicInput
              onSubmit={handleUserSpoke}
              prompt={userQuestionPrompt}
              speakerName={userQuestionSpeaker}
            />
          </div>
        )}

        {/* Continue button */}
        {!isGenerating &&
          !awaitingUserInput &&
          exchanges.length > 0 &&
          currentExchangeIndex >= exchanges.length - 1 && (
            <div className="px-4 mt-4 mb-24 text-center">
              <button
                onClick={() => generateRound('continue')}
                className="px-6 py-2.5 bg-dinner-terracotta text-white
                  rounded-lg font-serif text-sm hover:bg-dinner-terracotta/90 transition-all shadow-sm"
              >
                Continue the conversation
              </button>
            </div>
          )}

        {/* Generating indicator */}
        {isGenerating && exchanges.length > 0 && (
          <div className="px-4 mt-4 mb-24 text-center">
            <div className="inline-flex items-center gap-2 text-dinner-text-dim text-sm font-body">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-dinner-gold/50 animate-pulse"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  />
                ))}
              </div>
              The conversation continues...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
