/**
 * Voice Discovery — fetches and caches ElevenLabs voices, provides smart matching.
 *
 * On Creator tier the user has access to many voices (default + added from library).
 * We fetch them once, then use Claude to intelligently match voices to figures
 * based on voice descriptions and character personalities.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category?: string; // 'premade' | 'cloned' | 'generated' | 'professional'
  labels?: Record<string, string>; // { accent, age, gender, description, use_case }
  description?: string;
  preview_url?: string;
}

export interface CategorizedVoice {
  voiceId: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  age: 'young' | 'middle_aged' | 'old' | 'unknown';
  accent: string; // e.g. 'american', 'british', 'australian'
  description: string;
  useCase: string;
  category: string;
}

// ---------------------------------------------------------------------------
// In-memory cache (survives across requests in the same server instance)
// ---------------------------------------------------------------------------

let cachedVoices: CategorizedVoice[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Per-figure assignments: figureId → voiceId (stable within session)
const figureAssignments = new Map<string, string>();

// ---------------------------------------------------------------------------
// Fetch voices from ElevenLabs
// ---------------------------------------------------------------------------

export async function fetchAvailableVoices(): Promise<CategorizedVoice[]> {
  // Return cached if fresh
  if (cachedVoices && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedVoices;
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.warn('[VoiceDiscovery] No ELEVENLABS_API_KEY — using empty voice list');
    return [];
  }

  const allVoices: CategorizedVoice[] = [];
  let nextPageToken: string | undefined;
  let page = 0;

  try {
    // Paginate through all voices
    do {
      const params = new URLSearchParams({ page_size: '100' });
      if (nextPageToken) params.set('next_page_token', nextPageToken);

      const response = await fetch(
        `https://api.elevenlabs.io/v1/voices?${params.toString()}`,
        {
          headers: { 'xi-api-key': apiKey },
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[VoiceDiscovery] ElevenLabs error: ${response.status} ${errText}`);
        break;
      }

      const data = await response.json();
      const voices: ElevenLabsVoice[] = data.voices || [];

      for (const v of voices) {
        allVoices.push(categorizeVoice(v));
      }

      nextPageToken = data.next_page_token;
      page++;
    } while (nextPageToken && page < 10); // safety cap

    console.log(`[VoiceDiscovery] Loaded ${allVoices.length} voices from ElevenLabs`);

    cachedVoices = allVoices;
    cacheTimestamp = Date.now();
    return allVoices;
  } catch (err) {
    console.error('[VoiceDiscovery] Failed to fetch voices:', err);
    return cachedVoices || [];
  }
}

// ---------------------------------------------------------------------------
// Categorize a raw ElevenLabs voice into our structure
// ---------------------------------------------------------------------------

function categorizeVoice(v: ElevenLabsVoice): CategorizedVoice {
  const labels = v.labels || {};
  const genderRaw = (labels.gender || '').toLowerCase();
  const ageRaw = (labels.age || '').toLowerCase();
  const accentRaw = (labels.accent || '').toLowerCase();
  const descRaw = (labels.description || v.description || '').toLowerCase();
  const useCaseRaw = (labels.use_case || '').toLowerCase();

  let gender: CategorizedVoice['gender'] = 'neutral';
  if (genderRaw.includes('male') && !genderRaw.includes('female')) gender = 'male';
  else if (genderRaw.includes('female')) gender = 'female';

  let age: CategorizedVoice['age'] = 'unknown';
  if (ageRaw.includes('young')) age = 'young';
  else if (ageRaw.includes('middle')) age = 'middle_aged';
  else if (ageRaw.includes('old') || ageRaw.includes('senior') || ageRaw.includes('elderly')) age = 'old';

  return {
    voiceId: v.voice_id,
    name: v.name,
    gender,
    age,
    accent: accentRaw,
    description: descRaw,
    useCase: useCaseRaw,
    category: v.category || '',
  };
}

// ---------------------------------------------------------------------------
// AI-powered voice matching using Claude
// ---------------------------------------------------------------------------

export interface FigureVoiceRequest {
  figureId: string;
  gender: 'male' | 'female';
  nationality: string;
  voicePersonality: string;
  age?: 'young' | 'middle_aged' | 'old';
}

export interface VoiceAssignment {
  figureId: string;
  voiceId: string;
  voiceName: string;
  score: number;
}

async function matchWithClaude(
  figures: FigureVoiceRequest[],
  voices: CategorizedVoice[]
): Promise<VoiceAssignment[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return [];

  // Build voice catalog summary for Claude
  const voiceCatalog = voices.map((v) => ({
    id: v.voiceId,
    name: v.name,
    gender: v.gender,
    age: v.age,
    accent: v.accent,
    description: v.description,
    useCase: v.useCase,
  }));

  // Build figure summaries
  const figureSummaries = figures.map((f) => ({
    id: f.figureId,
    gender: f.gender,
    nationality: f.nationality,
    voicePersonality: f.voicePersonality,
    age: f.age,
  }));

  const prompt = `You are matching text-to-speech voices to historical/famous figures for a dinner party conversation simulator.

AVAILABLE VOICES:
${JSON.stringify(voiceCatalog, null, 1)}

DINNER GUESTS TO MATCH:
${JSON.stringify(figureSummaries, null, 1)}

RULES:
1. Each figure MUST get a DIFFERENT voice — no two figures share the same voice ID.
2. Gender must match (male figure → male voice, female figure → female voice). If no exact gender match exists, prefer "neutral" voices.
3. Consider accent/nationality fit (British figure → British-accented voice if available).
4. Consider personality fit — match the voice description to the figure's personality. A booming comedian needs a different voice than a quiet philosopher.
5. Consider age — young figures get younger voices, older figures get older/mature voices.
6. If a voice name sounds like it was designed for a specific character type, leverage that.

Return ONLY a valid JSON array with one object per figure:
[{"figureId": "figure-id", "voiceId": "voice-id", "voiceName": "Voice Name"}]

No explanation, no markdown, just the JSON array.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      console.error(`[VoiceDiscovery] Claude API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '';

    // Parse JSON — strip markdown fences if present
    let jsonStr = content.trim();
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) jsonStr = fenceMatch[1].trim();
    const bracketIdx = jsonStr.indexOf('[');
    if (bracketIdx > 0) jsonStr = jsonStr.slice(bracketIdx);

    const matches: Array<{ figureId: string; voiceId: string; voiceName: string }> = JSON.parse(jsonStr);

    // Validate that returned voice IDs actually exist
    const voiceIdSet = new Set(voices.map((v) => v.voiceId));
    const assignments: VoiceAssignment[] = [];
    const usedIds = new Set<string>();

    for (const match of matches) {
      if (voiceIdSet.has(match.voiceId) && !usedIds.has(match.voiceId)) {
        usedIds.add(match.voiceId);
        assignments.push({
          figureId: match.figureId,
          voiceId: match.voiceId,
          voiceName: match.voiceName || '',
          score: 100,
        });
      }
    }

    console.log(`[VoiceDiscovery] Claude matched ${assignments.length}/${figures.length} voices`);
    return assignments;
  } catch (err) {
    console.error('[VoiceDiscovery] Claude matching failed:', err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Fallback: simple scoring algorithm
// ---------------------------------------------------------------------------

function nationalityToAccent(nationality: string): string {
  const nat = nationality.toLowerCase();
  if (nat.includes('british') || nat.includes('english') || nat.includes('scottish') || nat.includes('welsh')) return 'british';
  if (nat.includes('irish')) return 'irish';
  if (nat.includes('american')) return 'american';
  if (nat.includes('australian')) return 'australian';
  if (nat.includes('french')) return 'french';
  if (nat.includes('german') || nat.includes('austrian') || nat.includes('prussian') || nat.includes('swiss')) return 'german';
  if (nat.includes('italian')) return 'italian';
  if (nat.includes('spanish')) return 'spanish';
  if (nat.includes('indian')) return 'indian';
  if (nat.includes('african')) return 'african';
  if (nat.includes('swedish') || nat.includes('scandinavian') || nat.includes('norwegian') || nat.includes('danish')) return 'scandinavian';
  return 'american'; // default
}

function scoreVoice(voice: CategorizedVoice, gender: 'male' | 'female', accent: string, age?: string, style?: string): number {
  let score = 0;

  if (voice.gender === gender) score += 100;
  else if (voice.gender === 'neutral') score += 20;
  else return -1000;

  if (accent && voice.accent.includes(accent)) score += 40;
  if (age && voice.age !== 'unknown' && voice.age === age) score += 20;

  if (style) {
    const styleWords = style.toLowerCase().split(/[\s,]+/);
    const desc = voice.description + ' ' + voice.useCase + ' ' + voice.name.toLowerCase();
    for (const word of styleWords) {
      if (word.length > 3 && desc.includes(word)) score += 6;
    }
  }

  if (voice.useCase.includes('narrat') || voice.useCase.includes('convers') ||
      voice.useCase.includes('character') || voice.useCase.includes('social')) {
    score += 10;
  }

  return score;
}

function fallbackMatch(figures: FigureVoiceRequest[], voices: CategorizedVoice[]): VoiceAssignment[] {
  const assignments: VoiceAssignment[] = [];
  const usedVoiceIds = new Set<string>();

  // Sort figures by constraint level (non-American accents first)
  const sortedFigures = [...figures].sort((a, b) => {
    const aAccent = nationalityToAccent(a.nationality);
    const bAccent = nationalityToAccent(b.nationality);
    return (bAccent !== 'american' ? 1 : 0) - (aAccent !== 'american' ? 1 : 0);
  });

  for (const fig of sortedFigures) {
    const accent = nationalityToAccent(fig.nationality);
    const scored = voices
      .map((v) => ({ voice: v, score: scoreVoice(v, fig.gender, accent, fig.age, fig.voicePersonality) }))
      .filter((s) => s.score >= 0)
      .sort((a, b) => b.score - a.score);

    let assigned = false;
    for (const { voice, score } of scored) {
      if (!usedVoiceIds.has(voice.voiceId)) {
        usedVoiceIds.add(voice.voiceId);
        assignments.push({ figureId: fig.figureId, voiceId: voice.voiceId, voiceName: voice.name, score });
        assigned = true;
        break;
      }
    }

    if (!assigned && scored.length > 0) {
      const best = scored[0];
      assignments.push({ figureId: fig.figureId, voiceId: best.voice.voiceId, voiceName: best.voice.name, score: best.score });
    }
  }

  return assignments;
}

// ---------------------------------------------------------------------------
// Main entry point: match voices for figures (AI-first, fallback to scoring)
// ---------------------------------------------------------------------------

export async function matchVoicesForFigures(
  figures: FigureVoiceRequest[]
): Promise<VoiceAssignment[]> {
  const voices = await fetchAvailableVoices();
  if (voices.length === 0) return [];

  console.log(`[VoiceDiscovery] Matching ${figures.length} figures against ${voices.length} available voices`);

  // Check for cached assignments first
  const uncached: FigureVoiceRequest[] = [];
  const cached: VoiceAssignment[] = [];
  for (const fig of figures) {
    const prev = figureAssignments.get(fig.figureId);
    if (prev) {
      const voice = voices.find((v) => v.voiceId === prev);
      if (voice) {
        cached.push({ figureId: fig.figureId, voiceId: prev, voiceName: voice.name, score: 100 });
        continue;
      }
    }
    uncached.push(fig);
  }

  if (uncached.length === 0) return cached;

  // Try AI-powered matching first
  let aiAssignments = await matchWithClaude(uncached, voices);

  // Fall back to scoring if Claude didn't match all figures
  if (aiAssignments.length < uncached.length) {
    const aiMatched = new Set(aiAssignments.map((a) => a.figureId));
    const unmatched = uncached.filter((f) => !aiMatched.has(f.figureId));
    if (unmatched.length > 0) {
      console.log(`[VoiceDiscovery] Falling back to scoring for ${unmatched.length} figures`);
      const fallbackAssignments = fallbackMatch(unmatched, voices);
      aiAssignments = [...aiAssignments, ...fallbackAssignments];
    }
  }

  // Cache all assignments
  for (const a of aiAssignments) {
    figureAssignments.set(a.figureId, a.voiceId);
  }

  return [...cached, ...aiAssignments];
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

export async function findVoiceForFigure(
  figureId: string,
  gender: 'male' | 'female',
  nationality: string,
  voicePersonality: string,
  age?: 'young' | 'middle_aged' | 'old'
): Promise<{ voiceId: string; name: string } | null> {
  const results = await matchVoicesForFigures([{
    figureId, gender, nationality, voicePersonality, age,
  }]);
  if (results.length > 0) {
    return { voiceId: results[0].voiceId, name: results[0].voiceName };
  }
  return null;
}

export function clearVoiceCache(): void {
  cachedVoices = null;
  cacheTimestamp = 0;
  figureAssignments.clear();
}
