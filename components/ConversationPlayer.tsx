'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ConversationExchange } from '@/lib/conversationOrchestrator';
import type { CharacterKnowledgeBase } from '@/lib/researchAgent';
import { useAudio } from '@/lib/useAudio';
import { getUniqueVoiceProfile, getNarratorVoiceId, getWebSpeechVoice, getVoiceSettingsForPersonality } from '@/lib/voiceProfiles';
import { FIGURES } from '@/lib/figures';

interface ConversationPlayerProps {
  exchanges: ConversationExchange[];
  guests: CharacterKnowledgeBase[];
  voiceAssignments?: Record<string, { voiceId: string; voiceName: string }>;
  isPlaying: boolean;
  onTogglePlay: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  currentExchangeIndex: number;
  onExchangeChange: (index: number) => void;
}

function getGuestColor(index: number): string {
  const colors = [
    'text-blue-700', 'text-emerald-700', 'text-amber-700',
    'text-pink-700', 'text-purple-700', 'text-cyan-700',
  ];
  return colors[index % colors.length];
}

function getGuestBorderColor(index: number): string {
  const colors = [
    'border-blue-300', 'border-emerald-300', 'border-amber-300',
    'border-pink-300', 'border-purple-300', 'border-cyan-300',
  ];
  return colors[index % colors.length];
}

export default function ConversationPlayer({
  exchanges,
  guests,
  voiceAssignments = {},
  isPlaying,
  onTogglePlay,
  audioEnabled,
  onToggleAudio,
  playbackSpeed,
  onSpeedChange,
  volume,
  onVolumeChange,
  currentExchangeIndex,
  onExchangeChange,
}: ConversationPlayerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSpokenIndex = useRef(-1);

  // Track which voice each figure is using — ensures no two figures share a voice
  const figureVoiceMap = useRef(new Map<string, { voiceId: string; settings: { stability: number; similarity_boost: number; style: number; use_speaker_boost: boolean } }>());
  const usedVoiceIds = useRef(new Set<string>());

  const guestMap = new Map(guests.map((g, i) => [g.figureId, { ...g, colorIndex: i }]));

  // Audio system
  const { speak, stop, isSpeaking } = useAudio({
    onEnd: () => {
      if (isPlaying && audioEnabled && currentExchangeIndex < exchanges.length - 1) {
        setTimeout(() => {
          onExchangeChange(currentExchangeIndex + 1);
        }, 400);
      }
    },
    playbackRate: playbackSpeed,
    volume,
  });

  // Auto-scroll to latest exchange
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [exchanges.length, currentExchangeIndex]);

  // Play audio when exchange changes and audio is enabled
  useEffect(() => {
    if (!isPlaying || !audioEnabled) {
      stop();
      return;
    }

    if (currentExchangeIndex >= exchanges.length) return;
    if (currentExchangeIndex === lastSpokenIndex.current) return;

    lastSpokenIndex.current = currentExchangeIndex;
    const exchange = exchanges[currentExchangeIndex];

    if (exchange.type === 'narration') {
      const narratorId = getNarratorVoiceId();
      speak(
        exchange.text,
        narratorId,
        { stability: 0.8, similarity_boost: 0.75, style: 0.3 },
        { lang: 'en-US', pitch: 1, rate: 0.9 }
      );
    } else if (exchange.speaker && exchange.speaker !== 'user') {
      const speakerId = exchange.speaker
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const figureKey = speakerId;

      // Check if we already assigned a voice to this figure in this session
      const cached = figureVoiceMap.current.get(figureKey);
      if (cached) {
        const figure = FIGURES.find((f) => f.id === exchange.speaker)
          || FIGURES.find((f) => f.id === speakerId);
        const webVoice = figure
          ? getWebSpeechVoice(figure.nationality, figure.voicePersonality, figure.id)
          : { lang: 'en-US', pitch: 1, rate: 1, voiceIndex: 0 };
        speak(exchange.text, cached.voiceId, cached.settings, webVoice);
      } else {
        // First time this figure speaks — assign them a unique voice
        const discovered = voiceAssignments[exchange.speaker] || voiceAssignments[speakerId];
        const figure = FIGURES.find((f) => f.id === exchange.speaker)
          || FIGURES.find((f) => f.id === speakerId)
          || FIGURES.find((f) => f.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === speakerId);

        let voiceId: string;
        let voiceSettings: { stability: number; similarity_boost: number; style: number; use_speaker_boost: boolean };

        if (discovered) {
          // Use the discovered voice from the user's ElevenLabs library
          voiceId = discovered.voiceId;
          voiceSettings = figure
            ? getVoiceSettingsForPersonality(figure.voicePersonality, figure.category)
            : { stability: 0.4, similarity_boost: 0.65, style: 0.5, use_speaker_boost: true };
        } else if (figure) {
          // Fall back to hardcoded — but ensure uniqueness across guests
          const profile = getUniqueVoiceProfile(
            figure.id, figure.voicePersonality, figure.category,
            figure.nationality, usedVoiceIds.current
          );
          voiceId = profile.elevenLabsVoiceId;
          voiceSettings = profile.voiceSettings;
        } else {
          const guest = guestMap.get(exchange.speaker) || guestMap.get(speakerId);
          const profile = getUniqueVoiceProfile(
            guest?.figureId || speakerId,
            guest?.speechPatterns || '', [],
            undefined, usedVoiceIds.current
          );
          voiceId = profile.elevenLabsVoiceId;
          voiceSettings = profile.voiceSettings;
        }

        // Cache the assignment so this figure always uses the same voice
        figureVoiceMap.current.set(figureKey, { voiceId, settings: voiceSettings });
        usedVoiceIds.current.add(voiceId);

        const webVoice = figure
          ? getWebSpeechVoice(figure.nationality, figure.voicePersonality, figure.id)
          : { lang: 'en-US', pitch: 1, rate: 1, voiceIndex: 0 };
        speak(exchange.text, voiceId, voiceSettings, webVoice);
      }
    } else {
      // User speech — skip audio, just advance after a pause
      const wordCount = exchange.text.split(/\s+/).length;
      const delay = Math.max((wordCount / (150 * playbackSpeed)) * 60000, 1500);
      setTimeout(() => {
        if (isPlaying && currentExchangeIndex < exchanges.length - 1) {
          onExchangeChange(currentExchangeIndex + 1);
        }
      }, delay);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, audioEnabled, currentExchangeIndex, exchanges.length]);

  // Reset spoken index when stopping
  useEffect(() => {
    if (!isPlaying || !audioEnabled) {
      lastSpokenIndex.current = -1;
    }
  }, [isPlaying, audioEnabled]);

  const getGuestName = useCallback(
    (figureId: string): string => {
      return figureId.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    },
    []
  );

  const speeds = [0.75, 1, 1.25, 1.5];

  return (
    <div className="flex flex-col h-full">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto dinner-scroll space-y-4 pb-24 px-4"
      >
        {exchanges.map((exchange, i) => {
          const guest = exchange.speaker ? guestMap.get(exchange.speaker) : null;
          const isActive = i === currentExchangeIndex;
          const isPast = i < currentExchangeIndex;
          const isUserQuestion = exchange.type === 'user-question';

          if (exchange.type === 'narration') {
            return (
              <div
                key={exchange.id}
                className={`text-center py-3 transition-opacity duration-300 ${isPast ? 'opacity-50' : 'opacity-100'}`}
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
              } ${isActive ? 'scale-[1.01]' : ''} ${isUserQuestion ? 'animate-pulse-gentle' : ''}`}
              onClick={() => onExchangeChange(i)}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-serif shrink-0 border
                  ${exchange.speaker === 'user'
                    ? 'bg-dinner-wine/20 border-dinner-wine text-dinner-gold-light'
                    : `bg-dinner-card ${guest ? getGuestBorderColor(guest.colorIndex) : 'border-dinner-border'}`}
                  ${isActive && isSpeaking ? 'ring-2 ring-dinner-gold/30' : ''}`}
              >
                {exchange.speaker === 'user'
                  ? 'You'
                  : exchange.speaker
                  ? getGuestName(exchange.speaker).split(' ').map((w) => w[0]).join('').slice(0, 2)
                  : '?'}
              </div>
              <div className="flex-1 min-w-0">
                <span
                  className={`text-xs font-serif ${
                    exchange.speaker === 'user'
                      ? 'text-dinner-gold-light'
                      : guest ? getGuestColor(guest.colorIndex) : 'text-dinner-text-secondary'
                  }`}
                >
                  {exchange.speaker === 'user'
                    ? 'You'
                    : exchange.speaker ? getGuestName(exchange.speaker) : 'Unknown'}
                </span>
                <p className="text-dinner-cream font-body text-sm leading-relaxed mt-0.5">
                  {exchange.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-dinner-border shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* Play/pause (only when audio enabled) */}
          {audioEnabled && (
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
          )}

          {/* Progress */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-dinner-text-secondary font-mono">
                {currentExchangeIndex + 1} / {exchanges.length}
              </span>
              <span className="text-dinner-text-dim font-mono truncate ml-2">
                {isSpeaking && audioEnabled ? '🔊 ' : ''}
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
                style={{ width: `${((currentExchangeIndex + 1) / exchanges.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Audio toggle */}
          <button
            onClick={onToggleAudio}
            className={`p-2 rounded-lg border transition-all shrink-0 ${
              audioEnabled
                ? 'border-dinner-gold/40 text-dinner-gold bg-dinner-gold/10'
                : 'border-dinner-border text-dinner-text-dim'
            }`}
            title={audioEnabled ? 'Mute audio' : 'Enable audio'}
          >
            {audioEnabled ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
          </button>

          {/* Volume (only when audio enabled) */}
          {audioEnabled && (
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-14 h-1 accent-dinner-gold appearance-none bg-dinner-border/50 rounded-full cursor-pointer shrink-0 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-dinner-gold"
            />
          )}

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
