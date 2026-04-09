/**
 * Voice Discovery — fetches and caches ElevenLabs voices, provides smart matching.
 *
 * On Creator tier the user has access to many voices (default + added from library).
 * We fetch them once, categorize by gender/age/accent/style, then score each voice
 * against a figure's characteristics to find the best match.
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

interface VoiceMatchCriteria {
  figureId: string;
  gender: 'male' | 'female';
  accent?: string;     // target accent e.g. 'british', 'american'
  age?: 'young' | 'middle_aged' | 'old';
  style?: string;      // personality keywords like 'warm', 'authoritative', 'energetic'
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
// Nationality → accent mapping
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

// ---------------------------------------------------------------------------
// Score a voice against criteria (higher = better match)
// ---------------------------------------------------------------------------

function scoreVoice(voice: CategorizedVoice, criteria: VoiceMatchCriteria): number {
  let score = 0;

  // Gender match (critical — must match)
  if (voice.gender === criteria.gender) score += 100;
  else if (voice.gender === 'neutral') score += 20;
  else return -1000; // hard reject wrong gender

  // Accent match
  if (criteria.accent) {
    if (voice.accent.includes(criteria.accent)) score += 40;
    // Partial matches
    else if (criteria.accent === 'british' && voice.accent.includes('english')) score += 35;
    else if (criteria.accent === 'american' && voice.accent.includes('us')) score += 35;
    // Penalize clearly wrong accents
    else if (voice.accent && criteria.accent !== 'american') score -= 5;
  }

  // Age match
  if (criteria.age && voice.age !== 'unknown') {
    if (voice.age === criteria.age) score += 20;
    // Adjacent ages are OK
    else if (
      (criteria.age === 'middle_aged' && (voice.age === 'young' || voice.age === 'old')) ||
      (criteria.age === 'young' && voice.age === 'middle_aged') ||
      (criteria.age === 'old' && voice.age === 'middle_aged')
    ) score += 8;
  }

  // Style/personality keyword matching against description
  if (criteria.style) {
    const styleWords = criteria.style.toLowerCase().split(/[\s,]+/);
    const desc = voice.description + ' ' + voice.useCase + ' ' + voice.name.toLowerCase();
    for (const word of styleWords) {
      if (word.length > 3 && desc.includes(word)) score += 6;
    }
  }

  // Prefer conversational / narration use cases for dinner party
  if (voice.useCase.includes('narrat') || voice.useCase.includes('convers') ||
      voice.useCase.includes('character') || voice.useCase.includes('social')) {
    score += 10;
  }

  // Slight preference for premade / professional voices (usually higher quality)
  if (voice.category === 'premade' || voice.category === 'professional') score += 5;
  if (voice.category === 'high_quality') score += 3;

  return score;
}

// ---------------------------------------------------------------------------
// Find the best voice for a figure
// ---------------------------------------------------------------------------

export async function findVoiceForFigure(
  figureId: string,
  gender: 'male' | 'female',
  nationality: string,
  voicePersonality: string,
  age?: 'young' | 'middle_aged' | 'old'
): Promise<{ voiceId: string; name: string } | null> {
  // Return cached assignment if we already matched this figure
  const cached = figureAssignments.get(figureId);
  if (cached) {
    const voices = await fetchAvailableVoices();
    const voice = voices.find((v) => v.voiceId === cached);
    if (voice) return { voiceId: voice.voiceId, name: voice.name };
  }

  const voices = await fetchAvailableVoices();
  if (voices.length === 0) return null;

  const criteria: VoiceMatchCriteria = {
    figureId,
    gender,
    accent: nationalityToAccent(nationality),
    age,
    style: voicePersonality,
  };

  // Score all voices
  const scored = voices.map((v) => ({
    voice: v,
    score: scoreVoice(v, criteria),
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Avoid assigning the same voice to multiple figures in the same session
  const usedVoiceIds = new Set(figureAssignments.values());

  // Find the best unused voice
  for (const { voice, score } of scored) {
    if (score < 0) continue;
    if (!usedVoiceIds.has(voice.voiceId)) {
      figureAssignments.set(figureId, voice.voiceId);
      return { voiceId: voice.voiceId, name: voice.name };
    }
  }

  // If all voices are used (very unlikely), just pick the best scoring one
  if (scored.length > 0 && scored[0].score >= 0) {
    figureAssignments.set(figureId, scored[0].voice.voiceId);
    return { voiceId: scored[0].voice.voiceId, name: scored[0].voice.name };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Build a full voice map for a set of figures at once (batch matching)
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

export async function matchVoicesForFigures(
  figures: FigureVoiceRequest[]
): Promise<VoiceAssignment[]> {
  const voices = await fetchAvailableVoices();
  if (voices.length === 0) return [];

  const assignments: VoiceAssignment[] = [];
  const usedVoiceIds = new Set<string>();

  // Sort figures by how constrained they are (harder to match first)
  // Figures with specific accents are more constrained
  const sortedFigures = [...figures].sort((a, b) => {
    const aAccent = nationalityToAccent(a.nationality);
    const bAccent = nationalityToAccent(b.nationality);
    const aConstrained = aAccent !== 'american' ? 1 : 0;
    const bConstrained = bAccent !== 'american' ? 1 : 0;
    return bConstrained - aConstrained;
  });

  for (const fig of sortedFigures) {
    // Check if already assigned
    const cached = figureAssignments.get(fig.figureId);
    if (cached) {
      const voice = voices.find((v) => v.voiceId === cached);
      if (voice) {
        usedVoiceIds.add(cached);
        assignments.push({
          figureId: fig.figureId,
          voiceId: cached,
          voiceName: voice.name,
          score: 100,
        });
        continue;
      }
    }

    const criteria: VoiceMatchCriteria = {
      figureId: fig.figureId,
      gender: fig.gender,
      accent: nationalityToAccent(fig.nationality),
      age: fig.age,
      style: fig.voicePersonality,
    };

    const scored = voices
      .map((v) => ({ voice: v, score: scoreVoice(v, criteria) }))
      .filter((s) => s.score >= 0)
      .sort((a, b) => b.score - a.score);

    // Pick best unused voice
    let assigned = false;
    for (const { voice, score } of scored) {
      if (!usedVoiceIds.has(voice.voiceId)) {
        usedVoiceIds.add(voice.voiceId);
        figureAssignments.set(fig.figureId, voice.voiceId);
        assignments.push({
          figureId: fig.figureId,
          voiceId: voice.voiceId,
          voiceName: voice.name,
          score,
        });
        assigned = true;
        break;
      }
    }

    // Fallback: allow reuse
    if (!assigned && scored.length > 0) {
      const best = scored[0];
      figureAssignments.set(fig.figureId, best.voice.voiceId);
      assignments.push({
        figureId: fig.figureId,
        voiceId: best.voice.voiceId,
        voiceName: best.voice.name,
        score: best.score,
      });
    }
  }

  return assignments;
}

// ---------------------------------------------------------------------------
// Clear cache (useful for testing)
// ---------------------------------------------------------------------------

export function clearVoiceCache(): void {
  cachedVoices = null;
  cacheTimestamp = 0;
  figureAssignments.clear();
}
