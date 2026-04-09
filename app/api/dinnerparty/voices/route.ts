import { NextRequest, NextResponse } from 'next/server';
import { matchVoicesForFigures, type FigureVoiceRequest } from '@/lib/voiceDiscovery';

/**
 * POST /api/dinnerparty/voices
 *
 * Accepts an array of figure characteristics, returns optimally matched
 * ElevenLabs voice IDs from the user's available voices (including their
 * curated library/collections).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { figures } = body as { figures: FigureVoiceRequest[] };

    if (!figures || !Array.isArray(figures) || figures.length === 0) {
      return NextResponse.json(
        { error: 'figures array is required' },
        { status: 400 }
      );
    }

    const assignments = await matchVoicesForFigures(figures);

    return NextResponse.json({
      assignments,
      count: assignments.length,
    });
  } catch (error) {
    console.error('[VoiceDiscovery] API error:', error);
    return NextResponse.json(
      { error: 'Voice discovery failed' },
      { status: 500 }
    );
  }
}
