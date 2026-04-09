import type { CharacterKnowledgeBase } from './researchAgent';

// ---------------------------------------------------------------------------
// Server-side in-memory cache (persists across requests in warm instances)
// ---------------------------------------------------------------------------

const serverCache = new Map<string, { data: CharacterKnowledgeBase; timestamp: number }>();
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function cacheKey(figureId: string, depth: string): string {
  return `research:${figureId}:${depth}`;
}

export function getFromServerCache(figureId: string, depth: string): CharacterKnowledgeBase | null {
  const key = cacheKey(figureId, depth);
  const entry = serverCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    serverCache.delete(key);
    return null;
  }
  return entry.data;
}

export function setInServerCache(figureId: string, depth: string, data: CharacterKnowledgeBase): void {
  const key = cacheKey(figureId, depth);
  serverCache.set(key, { data, timestamp: Date.now() });
}

// ---------------------------------------------------------------------------
// Client-side localStorage cache helpers (used from components)
// ---------------------------------------------------------------------------

const CLIENT_CACHE_PREFIX = 'dinner-research:';

export function getFromClientCache(figureId: string, depth: string): CharacterKnowledgeBase | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = `${CLIENT_CACHE_PREFIX}${figureId}:${depth}`;
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const entry = JSON.parse(stored) as { data: CharacterKnowledgeBase; timestamp: number };
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function setInClientCache(figureId: string, depth: string, data: CharacterKnowledgeBase): void {
  if (typeof window === 'undefined') return;
  try {
    const key = `${CLIENT_CACHE_PREFIX}${figureId}:${depth}`;
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // localStorage full or unavailable — silently skip
  }
}
