import { NextRequest, NextResponse } from 'next/server';
import { FIGURES, getFiguresByCategory } from '@/lib/figures';
import type { FigureCategory } from '@/lib/figures';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category') as FigureCategory | null;
  const search = searchParams.get('search')?.toLowerCase();

  let figures = category ? getFiguresByCategory(category) : FIGURES;

  if (search) {
    figures = figures.filter(
      (f) =>
        f.name.toLowerCase().includes(search) ||
        f.tagline.toLowerCase().includes(search) ||
        f.knownFor.some((k) => k.toLowerCase().includes(search)) ||
        f.category.some((c) => c.toLowerCase().includes(search))
    );
  }

  return NextResponse.json({ figures });
}
