'use client';

import { useRef, useCallback, useState } from 'react';

interface UseAudioOptions {
  onEnd?: () => void;
  playbackRate?: number;
  volume?: number;
}

interface VoiceSettings {
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export function useAudio({ onEnd, playbackRate = 1, volume = 1 }: UseAudioOptions = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  const stop = useCallback(() => {
    // Stop ElevenLabs audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    // Stop Web Speech
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    setIsSpeaking(false);
  }, []);

  const speakWithElevenLabs = useCallback(
    async (
      text: string,
      voiceId: string,
      voiceSettings?: VoiceSettings
    ): Promise<boolean> => {
      try {
        const response = await fetch('/api/dinnerparty/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voiceId, voiceSettings }),
        });

        if (!response.ok) {
          return false; // Signal to use fallback
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        return new Promise((resolve) => {
          const audio = new Audio(url);
          audio.playbackRate = playbackRate;
          audio.volume = Math.max(0, Math.min(1, volume));
          audioRef.current = audio;

          audio.onended = () => {
            URL.revokeObjectURL(url);
            audioRef.current = null;
            setIsSpeaking(false);
            onEndRef.current?.();
            resolve(true);
          };

          audio.onerror = () => {
            URL.revokeObjectURL(url);
            audioRef.current = null;
            setIsSpeaking(false);
            resolve(false);
          };

          setIsSpeaking(true);
          audio.play().catch(() => {
            setIsSpeaking(false);
            resolve(false);
          });
        });
      } catch {
        return false;
      }
    },
    [playbackRate, volume]
  );

  const speakWithWebSpeech = useCallback(
    (
      text: string,
      options?: { lang?: string; pitch?: number; rate?: number; voiceIndex?: number }
    ): boolean => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        return false;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options?.lang || 'en-US';
      utterance.pitch = options?.pitch || 1;
      utterance.rate = (options?.rate || 1) * playbackRate;
      utterance.volume = Math.max(0, Math.min(1, volume));

      // Pick a voice: prefer different voices for different characters
      const voices = window.speechSynthesis.getVoices();
      const langPrefix = utterance.lang.split('-')[0];
      const matchingVoices = voices.filter((v) => v.lang.startsWith(langPrefix));
      if (matchingVoices.length > 0) {
        const idx = (options?.voiceIndex ?? 0) % matchingVoices.length;
        utterance.voice = matchingVoices[idx];
      } else if (voices.length > 0) {
        // No lang match — pick any voice by index
        const idx = (options?.voiceIndex ?? 0) % voices.length;
        utterance.voice = voices[idx];
      }

      utterance.onend = () => {
        utteranceRef.current = null;
        setIsSpeaking(false);
        onEndRef.current?.();
      };

      utterance.onerror = () => {
        utteranceRef.current = null;
        setIsSpeaking(false);
      };

      utteranceRef.current = utterance;
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
      return true;
    },
    [playbackRate, volume]
  );

  const speak = useCallback(
    async (
      text: string,
      elevenLabsVoiceId?: string,
      voiceSettings?: VoiceSettings,
      webSpeechOptions?: { lang?: string; pitch?: number; rate?: number; voiceIndex?: number }
    ) => {
      stop();

      // Try ElevenLabs first
      if (elevenLabsVoiceId) {
        const success = await speakWithElevenLabs(
          text,
          elevenLabsVoiceId,
          voiceSettings
        );
        if (success) return;
      }

      // Fall back to Web Speech
      const webSuccess = speakWithWebSpeech(text, webSpeechOptions);

      // If no audio at all, just trigger onEnd after a delay
      if (!webSuccess) {
        setIsSpeaking(false);
        const wordCount = text.split(/\s+/).length;
        const delay = Math.max((wordCount / (150 * playbackRate)) * 60000, 1500);
        setTimeout(() => {
          onEndRef.current?.();
        }, delay);
      }
    },
    [stop, speakWithElevenLabs, speakWithWebSpeech, playbackRate]
  );

  return { speak, stop, isSpeaking };
}
