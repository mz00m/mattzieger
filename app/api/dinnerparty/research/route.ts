import { NextRequest, NextResponse } from 'next/server';
import { findFigureById } from '@/lib/customFigures';
import { quickResearch, deepResearch } from '@/lib/researchAgent';
import { getFromServerCache, setInServerCache } from '@/lib/researchCache';

// Research a SINGLE figure — called once per guest by the client
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { figureId, depth = 'quick' } = body as {
      figureId: string;
      depth: 'quick' | 'deep';
    };

    if (!figureId) {
      return NextResponse.json(
        { error: 'figureId is required' },
        { status: 400 }
      );
    }

    // Check server-side cache first
    const cached = getFromServerCache(figureId, depth);
    if (cached) {
      return NextResponse.json({ result: cached, cached: true });
    }

    const figure = findFigureById(figureId);
    if (!figure) {
      return NextResponse.json(
        { error: `Figure not found: ${figureId}` },
        { status: 404 }
      );
    }

    const result =
      depth === 'deep'
        ? await deepResearch(figure)
        : await quickResearch(figure);

    // Store in server cache
    setInServerCache(figureId, depth, result);

    return NextResponse.json({ result });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Research error:', msg);
    return NextResponse.json(
      { error: `Research failed: ${msg}` },
      { status: 500 }
    );
  }
}
