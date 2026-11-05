import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, tooLarge } from '@/lib/rateLimit';
import { matchVoicesForFigures, type FigureVoiceRequest } from '@/lib/voiceDiscovery';

/**
 * POST /api/dinnerparty/voices
 *
 * Accepts an array of figure characteristics, returns optimally matched
 * ElevenLabs voice IDs from the user's available voices (including their
 * curated library/collections).
 */
export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 'voices') ?? tooLarge(request, 50000);
  if (limited) return limited;

  try {
    const body = await request.json();
    const { figures, forceRematch } = body as { figures: FigureVoiceRequest[]; forceRematch?: boolean };

    if (!figures || !Array.isArray(figures) || figures.length === 0) {
      return NextResponse.json(
        { error: 'figures array is required' },
        { status: 400 }
      );
    }

    // Always force re-match for fresh sessions to use improved matching
    if (figures.length > 12) {
      return NextResponse.json({ error: 'At most 12 figures' }, { status: 400 });
    }

    const assignments = await matchVoicesForFigures(figures, forceRematch ?? true);

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
