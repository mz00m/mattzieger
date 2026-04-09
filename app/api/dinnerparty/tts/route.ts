import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
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
            stability: voiceSettings?.stability ?? 0.5,
            similarity_boost: voiceSettings?.similarity_boost ?? 0.75,
            style: voiceSettings?.style ?? 0.5,
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
