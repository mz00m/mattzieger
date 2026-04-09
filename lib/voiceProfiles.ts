export interface VoiceProfile {
  figureId: string;
  elevenLabsVoiceId: string;
  voiceSettings: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  };
  speakingRate?: number;
  pitchAdjustment?: string;
}

export type VoiceArchetype =
  | 'deliberate-thinker'
  | 'passionate-orator'
  | 'comedian'
  | 'scientist'
  | 'poet-writer'
  | 'storyteller'
  | 'mystic'
  | 'default';

// ---------------------------------------------------------------------------
// Archetype → voice settings
// ---------------------------------------------------------------------------

// Tuned for conversational, natural-sounding speech (not robotic narration)
// Lower stability = more expressive/human. Higher style = more personality.
const ARCHETYPE_SETTINGS: Record<
  VoiceArchetype,
  { stability: number; similarity_boost: number; style: number }
> = {
  'deliberate-thinker': { stability: 0.45, similarity_boost: 0.6, style: 0.4 },
  'passionate-orator': { stability: 0.3, similarity_boost: 0.65, style: 0.85 },
  comedian: { stability: 0.2, similarity_boost: 0.55, style: 0.95 },
  scientist: { stability: 0.4, similarity_boost: 0.6, style: 0.5 },
  'poet-writer': { stability: 0.35, similarity_boost: 0.65, style: 0.7 },
  storyteller: { stability: 0.3, similarity_boost: 0.6, style: 0.75 },
  mystic: { stability: 0.4, similarity_boost: 0.55, style: 0.6 },
  default: { stability: 0.35, similarity_boost: 0.6, style: 0.6 },
};

// ---------------------------------------------------------------------------
// Real ElevenLabs voice IDs from their default voice library
// These are pre-made voices available on all ElevenLabs accounts
// ---------------------------------------------------------------------------

const VOICES_DEEP_MALE = [
  'ErXwobaYiN019PkySvjV',  // Antoni - well-rounded, calm
  'VR6AewLTigWG4xSOukaG',  // Arnold - deep, authoritative
  'pNInz6obpgDQGcFmaJgB',  // Adam - deep, narration
];

const VOICES_WARM_MALE = [
  'TxGEqnHWrfWFTfGW9XjX',  // Josh - warm, conversational
  'yoZ06aMxZJJ28mfd3POQ',  // Sam - warm, narrative
  'ZQe5CZNOzWyzPSCn5a3c',  // James - calm, authoritative
];

const VOICES_ENERGETIC_MALE = [
  'jBpfuIE2acCO8z3wKNLl',  // Gigi - energetic (can sound male)
  'onwK4e9ZLuTAKqWW03F9',  // Daniel - British, measured
  'N2lVS1w4EtoT3dr4eOWO',  // Callum - lively, British
];

const VOICES_FEMALE_WARM = [
  '21m00Tcm4TlvDq8ikWAM',  // Rachel - calm, warm
  'EXAVITQu4vr4xnSDxMaL',  // Bella - soft, gentle
  'MF3mGyEYCl7XYWbV9V6O',  // Emily - calm, gentle
];

const VOICES_FEMALE_STRONG = [
  'ThT5KcBeYPX3keUQqHPh',  // Dorothy - pleasant, warm
  'AZnzlk1XvdvUeBnXmlld',  // Domi - strong, confident
  'jsCqWAovK2LkecY7zXl4',  // Freya - Nordic, strong
];

const VOICES_NARRATOR = [
  'pNInz6obpgDQGcFmaJgB',  // Adam - narration
  '21m00Tcm4TlvDq8ikWAM',  // Rachel - narration
];

// ---------------------------------------------------------------------------
// Stable voice assignment - hash figureId to get consistent voice
// ---------------------------------------------------------------------------

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickFromArray(arr: string[], figureId: string): string {
  return arr[hashCode(figureId) % arr.length];
}

// ---------------------------------------------------------------------------
// Known female figures (for voice assignment)
// ---------------------------------------------------------------------------

const KNOWN_FEMALE_IDS = new Set([
  'simone-de-beauvoir', 'hannah-arendt', 'simone-weil', 'marie-curie',
  'ada-lovelace', 'rosalind-franklin', 'rachel-carson', 'jane-austen',
  'virginia-woolf', 'toni-morrison', 'zora-neale-hurston', 'octavia-butler',
  'harriet-tubman', 'eleanor-roosevelt', 'ida-b-wells', 'sojourner-truth',
  'angela-davis', 'joan-rivers', 'moms-mabley', 'nora-ephron',
  'phyllis-diller', 'nina-simone', 'billie-holiday', 'aretha-franklin',
  'patti-smith', 'grace-hopper', 'bell-hooks', 'roxane-gay', 'brene-brown',
  'susan-sontag', 'frida-kahlo', 'georgia-okeeffe', 'maya-angelou',
  'mary-wollstonecraft', 'cleopatra', 'marie-antoinette', 'hypatia',
  'harriet-beecher-stowe', 'sylvia-plath', 'mary-shelley', 'emily-dickinson',
  'ella-fitzgerald', 'wu-zetian', 'amelia-earhart',
]);

// ---------------------------------------------------------------------------
// Archetype detection
// ---------------------------------------------------------------------------

function detectArchetype(
  voicePersonality: string,
  categories: string[]
): VoiceArchetype {
  const vp = voicePersonality.toLowerCase();
  const cats = categories.map((c) => c.toLowerCase());

  if (vp.includes('comic') || vp.includes('funny') || cats.includes('comedy')) return 'comedian';
  if (vp.includes('orator') || vp.includes('passionate') || vp.includes('rousing') || vp.includes('preacher') || cats.includes('civil rights')) return 'passionate-orator';
  if (vp.includes('poet') || vp.includes('lyric') || vp.includes('melodic') || cats.includes('literature')) return 'poet-writer';
  if (vp.includes('methodical') || vp.includes('precise') || vp.includes('analytical') || cats.includes('science')) return 'scientist';
  if (vp.includes('deliberate') || vp.includes('slow') || vp.includes('measured') || cats.includes('philosophy')) return 'deliberate-thinker';
  if (vp.includes('mystic') || vp.includes('spiritual') || cats.includes('religion & mysticism')) return 'mystic';
  if (vp.includes('storytell') || vp.includes('narrative') || vp.includes('anecdot')) return 'storyteller';

  return 'default';
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getVoiceProfile(
  figureId: string,
  voicePersonality: string,
  categories: string[]
): VoiceProfile {
  const archetype = detectArchetype(voicePersonality, categories);
  const settings = ARCHETYPE_SETTINGS[archetype];
  const isFemale = KNOWN_FEMALE_IDS.has(figureId);

  let voiceId: string;
  if (isFemale) {
    if (archetype === 'passionate-orator' || archetype === 'comedian') {
      voiceId = pickFromArray(VOICES_FEMALE_STRONG, figureId);
    } else {
      voiceId = pickFromArray(VOICES_FEMALE_WARM, figureId);
    }
  } else {
    if (archetype === 'comedian' || archetype === 'passionate-orator') {
      voiceId = pickFromArray(VOICES_ENERGETIC_MALE, figureId);
    } else if (archetype === 'deliberate-thinker' || archetype === 'mystic') {
      voiceId = pickFromArray(VOICES_DEEP_MALE, figureId);
    } else {
      voiceId = pickFromArray(VOICES_WARM_MALE, figureId);
    }
  }

  return {
    figureId,
    elevenLabsVoiceId: voiceId,
    voiceSettings: {
      stability: settings.stability,
      similarity_boost: settings.similarity_boost,
      style: settings.style,
      use_speaker_boost: true,
    },
    pitchAdjustment: voicePersonality,
  };
}

export function getNarratorVoiceId(): string {
  return VOICES_NARRATOR[0];
}

// ---------------------------------------------------------------------------
// Web Speech API fallback
// ---------------------------------------------------------------------------

export function getWebSpeechVoice(
  nationality: string,
  voicePersonality: string
): { lang: string; pitch: number; rate: number } {
  const nat = nationality.toLowerCase();
  const vp = voicePersonality.toLowerCase();

  let lang = 'en-US';
  if (nat.includes('british') || nat.includes('english')) lang = 'en-GB';
  else if (nat.includes('french')) lang = 'fr-FR';
  else if (nat.includes('german') || nat.includes('austrian') || nat.includes('prussian')) lang = 'de-DE';
  else if (nat.includes('italian')) lang = 'it-IT';
  else if (nat.includes('spanish')) lang = 'es-ES';
  else if (nat.includes('chinese')) lang = 'zh-CN';
  else if (nat.includes('russian')) lang = 'ru-RU';
  else if (nat.includes('indian')) lang = 'en-IN';

  let pitch = 1.0;
  let rate = 1.0;

  if (vp.includes('deep') || vp.includes('gravelly') || vp.includes('bass')) pitch = 0.8;
  if (vp.includes('high') || vp.includes('bright') || vp.includes('energetic')) pitch = 1.2;
  if (vp.includes('slow') || vp.includes('deliberate') || vp.includes('measured')) rate = 0.85;
  if (vp.includes('rapid') || vp.includes('energetic') || vp.includes('fast')) rate = 1.15;

  return { lang, pitch, rate };
}
