import { NextRequest, NextResponse } from 'next/server';
import {
  generateCustomFigure,
  addCustomFigure,
  getCustomFigures,
} from '@/lib/customFigures';

// GET: List all custom figures
export async function GET() {
  const figures = getCustomFigures();
  return NextResponse.json({ figures });
}

// POST: Create a new custom figure
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body as { name: string };

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Please provide a valid name' },
        { status: 400 }
      );
    }

    const figure = await generateCustomFigure(name.trim());
    addCustomFigure(figure);

    return NextResponse.json({ figure });
  } catch (error) {
    console.error('Custom figure error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create custom figure',
      },
      { status: 500 }
    );
  }
}
