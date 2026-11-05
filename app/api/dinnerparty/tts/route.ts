import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, tooLarge } from '@/lib/rateLimit';

const MAX_TTS_CHARS = 1500;
const VOICE_ID = /^[A-Za-z0-9]{8,40}$/;

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 'tts') ?? tooLarge(request, 20000);
  if (limited) return limited;

  try {
    const body = await request.json();
    const { text, voiceId, voiceSettings } = body as {
      text: string;
      voiceId: string;
      voiceSettings?: {
        stability?: number;
        similarity_boost?: number;
        style?: number;
        use_speaker_boost?: boolean;
      };
    };

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (typeof text !== 'string' || text.length > MAX_TTS_CHARS) {
      return NextResponse.json(
        { error: `Text must be at most ${MAX_TTS_CHARS} characters`, fallback: 'webspeech' },
        { status: 400 }
      );
    }
    // voiceId goes into the ElevenLabs URL path; anything but a plain ID could
    // redirect the request (and our API key) to another endpoint.
    if (voiceId && !VOICE_ID.test(voiceId)) {
      return NextResponse.json({ error: 'Invalid voiceId', fallback: 'webspeech' }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured', fallback: 'webspeech' },
        { status: 503 }
      );
    }

    const effectiveVoiceId =
      voiceId || process.env.ELEVENLABS_DEFAULT_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${effectiveVoiceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: voiceSettings?.stability ?? 0.35,
            similarity_boost: voiceSettings?.similarity_boost ?? 0.70,
            style: voiceSettings?.style ?? 0.6,
            use_speaker_boost: voiceSettings?.use_speaker_boost ?? true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[TTS] ElevenLabs error for voice ${effectiveVoiceId}: ${response.status} ${errorText}`);
      return NextResponse.json(
        { error: 'TTS generation failed', voiceId: effectiveVoiceId, fallback: 'webspeech' },
        { status: 503 }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json(
      { error: 'TTS service unavailable', fallback: 'webspeech' },
      { status: 503 }
    );
  }
}
