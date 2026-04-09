'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface SpeechRecognitionEvent {
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string };
    };
  };
}

interface UserMicInputProps {
  onSubmit: (transcript: string) => void;
  prompt?: string;
  speakerName?: string;
}

export default function UserMicInput({
  onSubmit,
  prompt,
  speakerName,
}: UserMicInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
  }, []);

  const startRecording = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback to text input
      setIsEditing(true);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      setTranscript(final);
      setInterimTranscript(interim);

      // Reset silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      silenceTimerRef.current = setTimeout(() => {
        stopRecording();
        setIsEditing(true);
      }, 2000);
    };

    recognition.onerror = () => {
      stopRecording();
      setIsEditing(true);
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (transcript || interimTranscript) {
        setIsEditing(true);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setTranscript('');
    setInterimTranscript('');
  }, [stopRecording, transcript, interimTranscript]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, []);

  const handleSubmit = () => {
    const finalText = transcript || interimTranscript;
    if (finalText.trim()) {
      onSubmit(finalText.trim());
      setTranscript('');
      setInterimTranscript('');
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-dinner-wine/10 border border-dinner-wine/30 rounded-lg p-4 space-y-3 animate-fade-in">
      {/* Prompt from figure */}
      {prompt && (
        <div className="text-center">
          <span className="text-dinner-gold text-xs font-serif">{speakerName} asks:</span>
          <p className="text-dinner-cream font-body text-sm italic mt-1">{prompt}</p>
        </div>
      )}

      {/* Recording state */}
      {!isEditing && !isRecording && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-dinner-text-secondary text-sm font-body">
            Your turn &mdash; tap to respond
          </p>
          <div className="flex gap-3">
            <button
              onClick={startRecording}
              className="w-14 h-14 rounded-full bg-dinner-wine/30 border-2 border-dinner-wine hover:bg-dinner-wine/50
                flex items-center justify-center text-dinner-gold-light transition-all animate-pulse-gentle"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="w-14 h-14 rounded-full bg-dinner-card border-2 border-dinner-border hover:border-dinner-gold/30
                flex items-center justify-center text-dinner-text-secondary transition-all"
              title="Type instead"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Active recording */}
      {isRecording && (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-xs font-mono">Recording...</span>
          </div>
          <p className="text-dinner-cream font-body text-sm min-h-[2em] text-center">
            {transcript}
            <span className="text-dinner-text-dim">{interimTranscript}</span>
          </p>
          <button
            onClick={() => {
              stopRecording();
              setIsEditing(true);
            }}
            className="text-dinner-text-secondary hover:text-dinner-cream text-xs underline"
          >
            Done speaking
          </button>
        </div>
      )}

      {/* Edit & confirm */}
      {isEditing && (
        <div className="space-y-2">
          <textarea
            ref={textareaRef}
            value={transcript || interimTranscript}
            onChange={(e) => {
              setTranscript(e.target.value);
              setInterimTranscript('');
            }}
            placeholder="Type your response..."
            rows={3}
            className="w-full bg-dinner-card border border-dinner-border rounded-lg px-3 py-2
              text-dinner-cream text-sm font-body resize-none
              focus:outline-none focus:border-dinner-wine/50"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setTranscript('');
                setInterimTranscript('');
                setIsEditing(false);
              }}
              className="px-3 py-1.5 text-dinner-text-secondary text-xs hover:text-dinner-cream transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-1.5 bg-dinner-wine/40 border border-dinner-wine text-dinner-gold-light text-xs rounded-lg
                hover:bg-dinner-wine/60 transition-colors"
            >
              Send to table
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
