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

const ARCHETYPE_SETTINGS: Record<
  VoiceArchetype,
  { stability: number; similarity_boost: number; style: number }
> = {
  'deliberate-thinker': { stability: 0.8, similarity_boost: 0.75, style: 0.3 },
  'passionate-orator': { stability: 0.5, similarity_boost: 0.8, style: 0.8 },
  comedian: { stability: 0.3, similarity_boost: 0.7, style: 0.9 },
  scientist: { stability: 0.7, similarity_boost: 0.75, style: 0.4 },
  'poet-writer': { stability: 0.6, similarity_boost: 0.8, style: 0.7 },
  storyteller: { stability: 0.55, similarity_boost: 0.75, style: 0.65 },
  mystic: { stability: 0.7, similarity_boost: 0.7, style: 0.5 },
  default: { stability: 0.5, similarity_boost: 0.75, style: 0.5 },
};

// ---------------------------------------------------------------------------
// Placeholder ElevenLabs voice IDs (user should replace with real ones)
// Rotated to give each figure a distinct voice
// ---------------------------------------------------------------------------

const VOICE_IDS_MALE = [
  'voice_male_deep_1',
  'voice_male_warm_1',
  'voice_male_sharp_1',
  'voice_male_gravelly_1',
  'voice_male_resonant_1',
  'voice_male_crisp_1',
];

const VOICE_IDS_FEMALE = [
  'voice_female_warm_1',
  'voice_female_clear_1',
  'voice_female_rich_1',
  'voice_female_bright_1',
  'voice_female_smooth_1',
];

// Simple round-robin counters
let maleIndex = 0;
let femaleIndex = 0;

function getNextVoiceId(personality: string): string {
  // Very rough heuristic — look for gendered keywords in the voice personality
  const lowerPersonality = personality.toLowerCase();
  const femaleSignals = [
    'feminine',
    'soprano',
    'contralto',
    'warm female',
    'maternal',
    'her ',
    'she ',
  ];

  const isFemale = femaleSignals.some((s) => lowerPersonality.includes(s));

  if (isFemale) {
    const id = VOICE_IDS_FEMALE[femaleIndex % VOICE_IDS_FEMALE.length];
    femaleIndex++;
    return id;
  }

  const id = VOICE_IDS_MALE[maleIndex % VOICE_IDS_MALE.length];
  maleIndex++;
  return id;
}

// ---------------------------------------------------------------------------
// Archetype detection
// ---------------------------------------------------------------------------

function detectArchetype(
  voicePersonality: string,
  categories: string[]
): VoiceArchetype {
  const vp = voicePersonality.toLowerCase();
  const cats = categories.map((c) => c.toLowerCase());

  if (
    vp.includes('comic') ||
    vp.includes('funny') ||
    vp.includes('wit') ||
    cats.includes('comedy')
  ) {
    return 'comedian';
  }
  if (
    vp.includes('orator') ||
    vp.includes('passionate') ||
    vp.includes('rousing') ||
    vp.includes('preacher') ||
    cats.includes('civil rights')
  ) {
    return 'passionate-orator';
  }
  if (
    vp.includes('poet') ||
    vp.includes('lyric') ||
    vp.includes('melodic') ||
    cats.includes('literature')
  ) {
    return 'poet-writer';
  }
  if (
    vp.includes('methodical') ||
    vp.includes('precise') ||
    vp.includes('analytical') ||
    cats.includes('science')
  ) {
    return 'scientist';
  }
  if (
    vp.includes('deliberate') ||
    vp.includes('slow') ||
    vp.includes('measured') ||
    cats.includes('philosophy')
  ) {
    return 'deliberate-thinker';
  }
  if (
    vp.includes('mystic') ||
    vp.includes('spiritual') ||
    vp.includes('contemplative') ||
    cats.includes('religion & mysticism')
  ) {
    return 'mystic';
  }
  if (
    vp.includes('storytell') ||
    vp.includes('narrative') ||
    vp.includes('anecdot')
  ) {
    return 'storyteller';
  }

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

  return {
    figureId,
    elevenLabsVoiceId: getNextVoiceId(voicePersonality),
    voiceSettings: {
      stability: settings.stability,
      similarity_boost: settings.similarity_boost,
      style: settings.style,
      use_speaker_boost: true,
    },
    pitchAdjustment: voicePersonality,
  };
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

  // Language mapping
  let lang = 'en-US';
  if (nat.includes('british') || nat.includes('english')) lang = 'en-GB';
  else if (nat.includes('french')) lang = 'fr-FR';
  else if (nat.includes('german') || nat.includes('austrian') || nat.includes('prussian'))
    lang = 'de-DE';
  else if (nat.includes('italian')) lang = 'it-IT';
  else if (nat.includes('spanish')) lang = 'es-ES';
  else if (nat.includes('chinese')) lang = 'zh-CN';
  else if (nat.includes('japanese')) lang = 'ja-JP';
  else if (nat.includes('russian')) lang = 'ru-RU';
  else if (nat.includes('indian')) lang = 'en-IN';
  else if (nat.includes('south african')) lang = 'en-ZA';
  else if (nat.includes('australian')) lang = 'en-AU';

  // Pitch and rate from personality
  let pitch = 1.0;
  let rate = 1.0;

  if (vp.includes('deep') || vp.includes('gravelly') || vp.includes('bass')) pitch = 0.8;
  if (vp.includes('high') || vp.includes('bright') || vp.includes('energetic')) pitch = 1.2;
  if (vp.includes('slow') || vp.includes('deliberate') || vp.includes('measured')) rate = 0.85;
  if (vp.includes('rapid') || vp.includes('energetic') || vp.includes('fast')) rate = 1.15;
  if (vp.includes('passionate') || vp.includes('intense')) rate = 1.05;

  return { lang, pitch, rate };
}
