import { NextRequest, NextResponse } from 'next/server';
import { getFigureById } from '@/lib/figures';
import { quickResearch, deepResearch } from '@/lib/researchAgent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { figureIds, depth = 'quick' } = body as {
      figureIds: string[];
      depth: 'quick' | 'deep';
    };

    if (!figureIds || !Array.isArray(figureIds) || figureIds.length === 0) {
      return NextResponse.json(
        { error: 'figureIds array is required' },
        { status: 400 }
      );
    }

    const figures = figureIds
      .map((id) => getFigureById(id))
      .filter((f) => f !== undefined);

    if (figures.length === 0) {
      return NextResponse.json(
        { error: 'No valid figures found' },
        { status: 404 }
      );
    }

    // For non-streaming: research all figures and return results
    const results = await Promise.all(
      figures.map((figure) =>
        depth === 'deep'
          ? deepResearch(figure)
          : quickResearch(figure)
      )
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Research error:', error);
    return NextResponse.json(
      { error: 'Research failed' },
      { status: 500 }
    );
  }
}

// Streaming endpoint for research progress
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const figureIdsParam = searchParams.get('figureIds');
  const depth = (searchParams.get('depth') || 'quick') as 'quick' | 'deep';

  if (!figureIdsParam) {
    return NextResponse.json(
      { error: 'figureIds query param required' },
      { status: 400 }
    );
  }

  const figureIds = figureIdsParam.split(',');
  const figures = figureIds
    .map((id) => getFigureById(id))
    .filter((f) => f !== undefined);

  if (figures.length === 0) {
    return NextResponse.json(
      { error: 'No valid figures found' },
      { status: 404 }
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: Record<string, unknown>) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        for (const figure of figures) {
          sendEvent({
            type: 'research-start',
            figureId: figure.id,
            figureName: figure.name,
          });

          const onProgress = (stage: string, progress: number) => {
            sendEvent({
              type: 'research-progress',
              figureId: figure.id,
              stage,
              progress,
            });
          };

          try {
            const result =
              depth === 'deep'
                ? await deepResearch(figure, onProgress)
                : await quickResearch(figure);

            sendEvent({
              type: 'research-complete',
              figureId: figure.id,
              result,
            });
          } catch (err) {
            sendEvent({
              type: 'research-error',
              figureId: figure.id,
              error: err instanceof Error ? err.message : 'Unknown error',
            });
          }
        }

        sendEvent({ type: 'all-complete' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
