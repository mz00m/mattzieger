'use client';

import { useRef, useCallback, useState } from 'react';

interface UseAudioOptions {
  onEnd?: () => void;
  playbackRate?: number;
}

interface VoiceSettings {
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export function useAudio({ onEnd, playbackRate = 1 }: UseAudioOptions = {}) {
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
    [playbackRate]
  );

  const speakWithWebSpeech = useCallback(
    (
      text: string,
      options?: { lang?: string; pitch?: number; rate?: number }
    ): boolean => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        return false;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options?.lang || 'en-US';
      utterance.pitch = options?.pitch || 1;
      utterance.rate = (options?.rate || 1) * playbackRate;

      // Try to find a matching voice
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(
        (v) => v.lang.startsWith(utterance.lang.split('-')[0])
      );
      if (matchingVoice) {
        utterance.voice = matchingVoice;
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
    [playbackRate]
  );

  const speak = useCallback(
    async (
      text: string,
      elevenLabsVoiceId?: string,
      voiceSettings?: VoiceSettings,
      webSpeechOptions?: { lang?: string; pitch?: number; rate?: number }
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
