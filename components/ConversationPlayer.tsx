'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ConversationExchange } from '@/lib/conversationOrchestrator';
import type { CharacterKnowledgeBase } from '@/lib/researchAgent';

interface ConversationPlayerProps {
  exchanges: ConversationExchange[];
  guests: CharacterKnowledgeBase[];
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  currentExchangeIndex: number;
  onExchangeChange: (index: number) => void;
  listeningMode: boolean;
}

function getGuestColor(index: number): string {
  const colors = [
    'text-blue-300',
    'text-emerald-300',
    'text-amber-300',
    'text-pink-300',
    'text-purple-300',
    'text-cyan-300',
  ];
  return colors[index % colors.length];
}

function getGuestBorderColor(index: number): string {
  const colors = [
    'border-blue-700/40',
    'border-emerald-700/40',
    'border-amber-700/40',
    'border-pink-700/40',
    'border-purple-700/40',
    'border-cyan-700/40',
  ];
  return colors[index % colors.length];
}

export default function ConversationPlayer({
  exchanges,
  guests,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onSpeedChange,
  currentExchangeIndex,
  onExchangeChange,
  listeningMode,
}: ConversationPlayerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [speakingFigure, setSpeakingFigure] = useState<string | null>(null);

  const guestMap = new Map(guests.map((g, i) => [g.figureId, { ...g, colorIndex: i }]));

  // Auto-scroll to latest exchange
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [exchanges.length, currentExchangeIndex]);

  // Auto-advance in play mode
  useEffect(() => {
    if (!isPlaying || currentExchangeIndex >= exchanges.length - 1) return;

    const exchange = exchanges[currentExchangeIndex];
    const wordsPerMinute = 150 * playbackSpeed;
    const wordCount = exchange.text.split(/\s+/).length;
    const readTime = (wordCount / wordsPerMinute) * 60 * 1000;
    const delay = Math.max(readTime, 1500 / playbackSpeed);

    if (exchange.speaker) {
      setSpeakingFigure(exchange.speaker);
    }

    const timer = setTimeout(() => {
      onExchangeChange(currentExchangeIndex + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, currentExchangeIndex, exchanges, playbackSpeed, onExchangeChange]);

  const getGuestName = useCallback(
    (figureId: string): string => {
      return figureId
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
    },
    []
  );

  const speeds = [0.75, 1, 1.25, 1.5];

  if (listeningMode) {
    const currentExchange = exchanges[currentExchangeIndex];
    const speakerName = currentExchange?.speaker ?? '';
    const guest = speakerName
      ? guestMap.get(speakerName)
      : null;

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] relative">
        {/* Ambient background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 rounded-full bg-dinner-candle/5 animate-pulse-gentle" />
        </div>

        {/* Current speaker */}
        <div className="relative z-10 text-center space-y-6">
          {currentExchange?.type === 'narration' ? (
            <p className="text-dinner-text-secondary italic font-body text-lg max-w-md">
              {currentExchange.text}
            </p>
          ) : (
            <>
              <div
                className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-2xl font-serif
                  bg-dinner-card border-2 ${guest ? getGuestBorderColor(guest.colorIndex) : 'border-dinner-border'}
                  ${isPlaying ? 'animate-pulse-gentle' : ''}`}
              >
                {speakerName
                  ? getGuestName(speakerName)
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)
                  : '?'}
              </div>
              <h3
                className={`font-serif text-2xl ${guest ? getGuestColor(guest.colorIndex) : 'text-dinner-cream'}`}
              >
                {speakerName
                  ? getGuestName(speakerName)
                  : ''}
              </h3>
              <p className="text-dinner-cream font-body text-lg max-w-lg leading-relaxed">
                {currentExchange?.text}
              </p>
            </>
          )}
        </div>

        {/* Bottom controls */}
        <div className="fixed bottom-0 left-0 right-0 bg-dinner-bg/95 backdrop-blur border-t border-dinner-border p-4">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <button
              onClick={() =>
                onExchangeChange(Math.max(0, currentExchangeIndex - 1))
              }
              className="text-dinner-text-secondary hover:text-dinner-cream p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={onTogglePlay}
              className="w-12 h-12 rounded-full bg-dinner-gold/20 border border-dinner-gold/40 flex items-center justify-center text-dinner-gold hover:bg-dinner-gold/30 transition-colors"
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <button
              onClick={() =>
                onExchangeChange(
                  Math.min(exchanges.length - 1, currentExchangeIndex + 1)
                )
              }
              className="text-dinner-text-secondary hover:text-dinner-cream p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Reading mode
  return (
    <div className="flex flex-col h-full">
      {/* Conversation scroll */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto dinner-scroll space-y-4 pb-24 px-4"
      >
        {exchanges.map((exchange, i) => {
          const guest = exchange.speaker
            ? guestMap.get(exchange.speaker)
            : null;
          const isActive = i === currentExchangeIndex;
          const isPast = i < currentExchangeIndex;
          const isUserQuestion = exchange.type === 'user-question';

          if (exchange.type === 'narration') {
            return (
              <div
                key={exchange.id}
                className={`text-center py-3 transition-opacity duration-300 ${
                  isPast ? 'opacity-50' : 'opacity-100'
                }`}
              >
                <p className="text-dinner-text-dim italic font-body text-sm max-w-md mx-auto">
                  {exchange.text}
                </p>
              </div>
            );
          }

          return (
            <div
              key={exchange.id}
              className={`flex gap-3 max-w-2xl transition-all duration-300 ${
                isPast ? 'opacity-60' : 'opacity-100'
              } ${isActive ? 'scale-[1.01]' : ''} ${
                isUserQuestion ? 'animate-pulse-gentle' : ''
              }`}
              onClick={() => onExchangeChange(i)}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-serif shrink-0 border
                  ${
                    exchange.speaker === 'user'
                      ? 'bg-dinner-wine/20 border-dinner-wine text-dinner-gold-light'
                      : `bg-dinner-card ${guest ? getGuestBorderColor(guest.colorIndex) : 'border-dinner-border'}`
                  }
                  ${isActive && isPlaying ? 'ring-2 ring-dinner-gold/30' : ''}
                `}
              >
                {exchange.speaker === 'user'
                  ? 'You'
                  : exchange.speaker
                  ? getGuestName(exchange.speaker)
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)
                  : '?'}
              </div>

              {/* Speech bubble */}
              <div className="flex-1 min-w-0">
                <span
                  className={`text-xs font-serif ${
                    exchange.speaker === 'user'
                      ? 'text-dinner-gold-light'
                      : guest
                      ? getGuestColor(guest.colorIndex)
                      : 'text-dinner-text-secondary'
                  }`}
                >
                  {exchange.speaker === 'user'
                    ? 'You'
                    : exchange.speaker
                    ? getGuestName(exchange.speaker)
                    : 'Unknown'}
                </span>
                <p className="text-dinner-cream font-body text-sm leading-relaxed mt-0.5">
                  {exchange.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Audio player bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-dinner-bg/95 backdrop-blur border-t border-dinner-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Play/Pause */}
          <button
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-full bg-dinner-gold/20 border border-dinner-gold/40 flex items-center justify-center text-dinner-gold hover:bg-dinner-gold/30 transition-colors shrink-0"
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Progress */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-dinner-text-secondary font-mono">
                {currentExchangeIndex + 1} / {exchanges.length}
              </span>
              <span className="text-dinner-text-dim font-mono truncate ml-2">
                {exchanges[currentExchangeIndex]?.speaker === 'user'
                  ? 'You'
                  : exchanges[currentExchangeIndex]?.speaker
                  ? getGuestName(exchanges[currentExchangeIndex].speaker!)
                  : 'Narration'}
              </span>
            </div>
            <div className="h-1 bg-dinner-border/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-dinner-gold/60 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentExchangeIndex + 1) / exchanges.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Speed */}
          <button
            onClick={() => {
              const currentIdx = speeds.indexOf(playbackSpeed);
              const nextIdx = (currentIdx + 1) % speeds.length;
              onSpeedChange(speeds[nextIdx]);
            }}
            className="text-dinner-text-secondary hover:text-dinner-gold text-xs font-mono px-2 py-1 rounded border border-dinner-border hover:border-dinner-gold/30 transition-colors shrink-0"
          >
            {playbackSpeed}x
          </button>
        </div>
      </div>
    </div>
  );
}
