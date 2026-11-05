import { NextRequest, NextResponse } from 'next/server';

/**
 * Per-instance fixed-window limiter for the dinner-party API.
 *
 * Every POST route here spends Anthropic or ElevenLabs credit, so each one
 * gets a per-IP cap and a per-instance global cap. State is in memory, so a
 * determined caller spread across cold starts can exceed it; the provider
 * spend caps are the backstop.
 */

type Bucket = { limit: number; globalLimit: number; windowMs: number };

export const LIMITS = {
  conversation: { limit: 40, globalLimit: 200, windowMs: 10 * 60_000 },
  tts: { limit: 200, globalLimit: 1000, windowMs: 10 * 60_000 },
  research: { limit: 20, globalLimit: 100, windowMs: 10 * 60_000 },
  customFigure: { limit: 10, globalLimit: 50, windowMs: 10 * 60_000 },
  voices: { limit: 20, globalLimit: 100, windowMs: 10 * 60_000 },
} satisfies Record<string, Bucket>;

const counters = new Map<string, { count: number; resetAt: number }>();

function hit(key: string, limit: number, windowMs: number, now: number): boolean {
  const entry = counters.get(key);
  if (!entry || entry.resetAt <= now) {
    counters.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}

function clientIp(req: NextRequest): string {
  // Vercel sets x-forwarded-for itself and drops client-supplied values.
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
}

/** Returns a 429 response when over the limit, otherwise null. */
export function rateLimit(req: NextRequest, name: keyof typeof LIMITS): NextResponse | null {
  const { limit, globalLimit, windowMs } = LIMITS[name];
  const now = Date.now();
  if (counters.size > 10_000) {
    counters.forEach((v, k) => {
      if (v.resetAt <= now) counters.delete(k);
    });
  }
  const ipOk = hit(`${name}:${clientIp(req)}`, limit, windowMs, now);
  const globalOk = hit(`${name}:global`, globalLimit, windowMs, now);
  if (ipOk && globalOk) return null;
  return NextResponse.json(
    { error: 'Too many requests. Try again in a few minutes.', fallback: 'webspeech' },
    { status: 429, headers: { 'Retry-After': String(Math.ceil(windowMs / 1000)) } }
  );
}

/** Rejects request bodies above maxBytes before they are parsed. */
export function tooLarge(req: NextRequest, maxBytes: number): NextResponse | null {
  const length = Number(req.headers.get('content-length') ?? 0);
  if (length > maxBytes) {
    return NextResponse.json({ error: 'Request too large' }, { status: 413 });
  }
  return null;
}
