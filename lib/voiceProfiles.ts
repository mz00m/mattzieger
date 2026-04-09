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
// ElevenLabs pre-made voice IDs
// Only using voices guaranteed available on all ElevenLabs accounts
// ---------------------------------------------------------------------------

// Male voices (core pre-made)
const V_ADAM    = 'pNInz6obpgDQGcFmaJgB';  // Deep narration
const V_ANTONI  = 'ErXwobaYiN019PkySvjV';  // Well-rounded, calm
const V_ARNOLD  = 'VR6AewLTigWG4xSOukaG';  // Deep, authoritative
const V_JOSH    = 'TxGEqnHWrfWFTfGW9XjX';  // Warm, conversational
const V_SAM     = 'yoZ06aMxZJJ28mfd3POQ';  // Warm, narrative

// Female voices (core pre-made)
const V_RACHEL  = '21m00Tcm4TlvDq8ikWAM';  // Calm, warm
const V_BELLA   = 'EXAVITQu4vr4xnSDxMaL';  // Soft, gentle
const V_DOMI    = 'AZnzlk1XvdvUeBnXmlld';  // Strong, confident
const V_ELLI    = 'MF3mGyEYCl7XYWbV9V6O';  // Young, gentle

// ---------------------------------------------------------------------------
// Per-figure voice overrides — hand-picked for recognizable characters
// Each entry: voiceId + individually tuned settings
// ---------------------------------------------------------------------------

interface VoiceOverride {
  voiceId: string;
  stability: number;
  similarity_boost: number;
  style: number;
}

// Voice differentiation strategy: 9 core voices x varied settings = distinct characters
// Each figure gets a unique voice + settings combo. Even same voice sounds very
// different with stability 0.2 vs 0.6, or style 0.3 vs 0.9.
const FIGURE_VOICE_OVERRIDES: Record<string, VoiceOverride> = {
  // === PHILOSOPHY ===
  'socrates':            { voiceId: V_JOSH,    stability: 0.40, similarity_boost: 0.60, style: 0.50 },
  'plato':               { voiceId: V_ADAM,    stability: 0.50, similarity_boost: 0.55, style: 0.35 },
  'aristotle':           { voiceId: V_SAM,     stability: 0.45, similarity_boost: 0.60, style: 0.40 },
  'nietzsche':           { voiceId: V_ARNOLD,  stability: 0.15, similarity_boost: 0.60, style: 0.95 },
  'simone-de-beauvoir':  { voiceId: V_RACHEL,  stability: 0.30, similarity_boost: 0.65, style: 0.70 },
  'hannah-arendt':       { voiceId: V_ELLI,    stability: 0.40, similarity_boost: 0.60, style: 0.55 },
  'bertrand-russell':    { voiceId: V_ANTONI,  stability: 0.45, similarity_boost: 0.55, style: 0.45 },
  'simone-weil':         { voiceId: V_BELLA,   stability: 0.50, similarity_boost: 0.55, style: 0.35 },
  'albert-camus':        { voiceId: V_SAM,     stability: 0.30, similarity_boost: 0.60, style: 0.65 },
  'lao-tzu':             { voiceId: V_ADAM,    stability: 0.60, similarity_boost: 0.50, style: 0.25 },
  'confucius':           { voiceId: V_JOSH,    stability: 0.55, similarity_boost: 0.55, style: 0.30 },
  'ibn-rushd':           { voiceId: V_ADAM,    stability: 0.45, similarity_boost: 0.60, style: 0.45 },
  'mary-wollstonecraft': { voiceId: V_DOMI,   stability: 0.30, similarity_boost: 0.65, style: 0.75 },
  'john-stuart-mill':    { voiceId: V_ANTONI,  stability: 0.50, similarity_boost: 0.55, style: 0.35 },
  'immanuel-kant':       { voiceId: V_SAM,     stability: 0.55, similarity_boost: 0.50, style: 0.25 },
  'sigmund-freud':       { voiceId: V_ARNOLD,  stability: 0.40, similarity_boost: 0.60, style: 0.55 },
  'noam-chomsky':        { voiceId: V_JOSH,    stability: 0.45, similarity_boost: 0.55, style: 0.40 },

  // === SCIENCE ===
  'marie-curie':         { voiceId: V_RACHEL,  stability: 0.50, similarity_boost: 0.55, style: 0.35 },
  'richard-feynman':     { voiceId: V_JOSH,    stability: 0.15, similarity_boost: 0.65, style: 0.90 },
  'charles-darwin':      { voiceId: V_ANTONI,  stability: 0.50, similarity_boost: 0.55, style: 0.40 },
  'ada-lovelace':        { voiceId: V_BELLA,   stability: 0.40, similarity_boost: 0.60, style: 0.55 },
  'alan-turing':         { voiceId: V_SAM,     stability: 0.50, similarity_boost: 0.50, style: 0.30 },
  'nikola-tesla':        { voiceId: V_ANTONI,  stability: 0.20, similarity_boost: 0.65, style: 0.85 },
  'albert-einstein':     { voiceId: V_JOSH,    stability: 0.35, similarity_boost: 0.60, style: 0.55 },
  'carl-sagan':          { voiceId: V_ADAM,    stability: 0.25, similarity_boost: 0.70, style: 0.80 },
  'rachel-carson':       { voiceId: V_ELLI,    stability: 0.45, similarity_boost: 0.60, style: 0.50 },
  'rosalind-franklin':   { voiceId: V_RACHEL,  stability: 0.45, similarity_boost: 0.55, style: 0.45 },
  'neil-degrasse-tyson': { voiceId: V_ARNOLD,  stability: 0.20, similarity_boost: 0.70, style: 0.90 },
  'stephen-hawking':     { voiceId: V_SAM,     stability: 0.60, similarity_boost: 0.50, style: 0.20 },
  'isaac-newton':        { voiceId: V_ADAM,    stability: 0.50, similarity_boost: 0.55, style: 0.35 },

  // === LITERATURE ===
  'shakespeare':         { voiceId: V_ARNOLD,  stability: 0.20, similarity_boost: 0.60, style: 0.90 },
  'jane-austen':         { voiceId: V_BELLA,   stability: 0.45, similarity_boost: 0.60, style: 0.55 },
  'mark-twain':          { voiceId: V_SAM,     stability: 0.20, similarity_boost: 0.60, style: 0.85 },
  'virginia-woolf':      { voiceId: V_BELLA,   stability: 0.30, similarity_boost: 0.65, style: 0.70 },
  'james-baldwin':       { voiceId: V_JOSH,    stability: 0.25, similarity_boost: 0.65, style: 0.80 },
  'toni-morrison':       { voiceId: V_DOMI,    stability: 0.30, similarity_boost: 0.65, style: 0.75 },
  'oscar-wilde':         { voiceId: V_ANTONI,  stability: 0.15, similarity_boost: 0.60, style: 0.95 },
  'george-orwell':       { voiceId: V_SAM,     stability: 0.45, similarity_boost: 0.55, style: 0.45 },
  'david-foster-wallace':{ voiceId: V_JOSH,    stability: 0.20, similarity_boost: 0.55, style: 0.80 },
  'zora-neale-hurston':  { voiceId: V_RACHEL,  stability: 0.25, similarity_boost: 0.65, style: 0.75 },
  'franz-kafka':         { voiceId: V_ADAM,    stability: 0.50, similarity_boost: 0.50, style: 0.30 },
  'jorge-luis-borges':   { voiceId: V_ANTONI,  stability: 0.40, similarity_boost: 0.55, style: 0.50 },
  'fyodor-dostoevsky':   { voiceId: V_ARNOLD,  stability: 0.30, similarity_boost: 0.55, style: 0.70 },
  'octavia-butler':      { voiceId: V_DOMI,    stability: 0.35, similarity_boost: 0.60, style: 0.65 },
  'emily-dickinson':     { voiceId: V_BELLA,   stability: 0.55, similarity_boost: 0.55, style: 0.35 },
  'mary-shelley':        { voiceId: V_ELLI,    stability: 0.35, similarity_boost: 0.60, style: 0.60 },
  'maya-angelou':        { voiceId: V_DOMI,    stability: 0.25, similarity_boost: 0.70, style: 0.85 },

  // === POLITICS & CIVIL RIGHTS ===
  'frederick-douglass':  { voiceId: V_ADAM,    stability: 0.25, similarity_boost: 0.70, style: 0.85 },
  'harriet-tubman':      { voiceId: V_DOMI,    stability: 0.30, similarity_boost: 0.65, style: 0.70 },
  'martin-luther-king-jr': { voiceId: V_ARNOLD, stability: 0.20, similarity_boost: 0.75, style: 0.95 },
  'malcolm-x':           { voiceId: V_ADAM,    stability: 0.20, similarity_boost: 0.70, style: 0.90 },
  'nelson-mandela':      { voiceId: V_JOSH,    stability: 0.35, similarity_boost: 0.65, style: 0.60 },
  'mahatma-gandhi':      { voiceId: V_SAM,     stability: 0.50, similarity_boost: 0.55, style: 0.40 },
  'eleanor-roosevelt':   { voiceId: V_RACHEL,  stability: 0.40, similarity_boost: 0.60, style: 0.50 },
  'winston-churchill':   { voiceId: V_ARNOLD,  stability: 0.30, similarity_boost: 0.65, style: 0.80 },
  'ida-b-wells':         { voiceId: V_DOMI,    stability: 0.25, similarity_boost: 0.65, style: 0.80 },
  'sojourner-truth':     { voiceId: V_RACHEL,  stability: 0.25, similarity_boost: 0.70, style: 0.80 },
  'angela-davis':        { voiceId: V_DOMI,    stability: 0.20, similarity_boost: 0.70, style: 0.90 },
  'abraham-lincoln':     { voiceId: V_SAM,     stability: 0.40, similarity_boost: 0.60, style: 0.50 },
  'barack-obama':        { voiceId: V_JOSH,    stability: 0.30, similarity_boost: 0.70, style: 0.70 },

  // === COMEDY ===
  'george-carlin':       { voiceId: V_JOSH,    stability: 0.10, similarity_boost: 0.60, style: 0.95 },
  'richard-pryor':       { voiceId: V_SAM,     stability: 0.15, similarity_boost: 0.60, style: 0.90 },
  'robin-williams':      { voiceId: V_ANTONI,  stability: 0.10, similarity_boost: 0.55, style: 0.95 },
  'joan-rivers':         { voiceId: V_DOMI,    stability: 0.10, similarity_boost: 0.60, style: 0.95 },
  'lenny-bruce':         { voiceId: V_ARNOLD,  stability: 0.20, similarity_boost: 0.55, style: 0.85 },
  'moms-mabley':         { voiceId: V_RACHEL,  stability: 0.20, similarity_boost: 0.60, style: 0.85 },
  'bill-hicks':          { voiceId: V_ADAM,    stability: 0.15, similarity_boost: 0.60, style: 0.90 },
  'nora-ephron':         { voiceId: V_ELLI,    stability: 0.25, similarity_boost: 0.60, style: 0.75 },
  'phyllis-diller':      { voiceId: V_BELLA,   stability: 0.10, similarity_boost: 0.60, style: 0.95 },

  // === MUSIC ===
  'mozart':              { voiceId: V_ANTONI,  stability: 0.15, similarity_boost: 0.60, style: 0.90 },
  'beethoven':           { voiceId: V_ARNOLD,  stability: 0.25, similarity_boost: 0.65, style: 0.75 },
  'louis-armstrong':     { voiceId: V_SAM,     stability: 0.20, similarity_boost: 0.65, style: 0.80 },
  'nina-simone':         { voiceId: V_DOMI,    stability: 0.20, similarity_boost: 0.70, style: 0.85 },
  'bob-dylan':           { voiceId: V_SAM,     stability: 0.35, similarity_boost: 0.50, style: 0.55 },
  'billie-holiday':      { voiceId: V_BELLA,   stability: 0.25, similarity_boost: 0.70, style: 0.75 },
  'miles-davis':         { voiceId: V_ADAM,    stability: 0.45, similarity_boost: 0.50, style: 0.40 },
  'freddie-mercury':     { voiceId: V_JOSH,    stability: 0.10, similarity_boost: 0.65, style: 0.95 },
  'johnny-cash':         { voiceId: V_ADAM,    stability: 0.40, similarity_boost: 0.65, style: 0.50 },
  'aretha-franklin':     { voiceId: V_DOMI,    stability: 0.20, similarity_boost: 0.70, style: 0.90 },
  'david-bowie':         { voiceId: V_ANTONI,  stability: 0.15, similarity_boost: 0.60, style: 0.90 },
  'leonard-cohen':       { voiceId: V_ADAM,    stability: 0.45, similarity_boost: 0.55, style: 0.45 },
  'patti-smith':         { voiceId: V_RACHEL,  stability: 0.20, similarity_boost: 0.65, style: 0.80 },

  // === TECHNOLOGY ===
  'steve-jobs':          { voiceId: V_ARNOLD,  stability: 0.25, similarity_boost: 0.70, style: 0.85 },
  'grace-hopper':        { voiceId: V_RACHEL,  stability: 0.35, similarity_boost: 0.60, style: 0.60 },
  'tim-berners-lee':     { voiceId: V_SAM,     stability: 0.50, similarity_boost: 0.55, style: 0.35 },
  'aaron-swartz':        { voiceId: V_JOSH,    stability: 0.30, similarity_boost: 0.60, style: 0.70 },
  'buckminster-fuller':  { voiceId: V_SAM,     stability: 0.20, similarity_boost: 0.60, style: 0.75 },

  // === MODERN THINKERS ===
  'christopher-hitchens': { voiceId: V_ARNOLD,  stability: 0.20, similarity_boost: 0.70, style: 0.90 },
  'susan-sontag':        { voiceId: V_RACHEL,  stability: 0.35, similarity_boost: 0.60, style: 0.60 },
  'bell-hooks':          { voiceId: V_ELLI,    stability: 0.35, similarity_boost: 0.60, style: 0.60 },
  'cornel-west':         { voiceId: V_ARNOLD,  stability: 0.15, similarity_boost: 0.70, style: 0.95 },
  'ta-nehisi-coates':    { voiceId: V_JOSH,    stability: 0.35, similarity_boost: 0.60, style: 0.65 },
  'roxane-gay':          { voiceId: V_DOMI,    stability: 0.35, similarity_boost: 0.60, style: 0.60 },
  'malcolm-gladwell':    { voiceId: V_ANTONI,  stability: 0.30, similarity_boost: 0.60, style: 0.70 },
  'yuval-noah-harari':   { voiceId: V_SAM,     stability: 0.40, similarity_boost: 0.55, style: 0.50 },
  'brene-brown':         { voiceId: V_BELLA,   stability: 0.30, similarity_boost: 0.60, style: 0.65 },
  'frida-kahlo':         { voiceId: V_DOMI,    stability: 0.20, similarity_boost: 0.70, style: 0.85 },
  'leonardo-da-vinci':   { voiceId: V_ANTONI,  stability: 0.35, similarity_boost: 0.60, style: 0.55 },

  // === OTHER ===
  'adam-smith':          { voiceId: V_SAM,     stability: 0.45, similarity_boost: 0.55, style: 0.40 },
  'karl-marx':           { voiceId: V_ARNOLD,  stability: 0.25, similarity_boost: 0.65, style: 0.80 },
  'rumi':                { voiceId: V_ADAM,    stability: 0.45, similarity_boost: 0.55, style: 0.55 },
  'amelia-earhart':      { voiceId: V_DOMI,    stability: 0.35, similarity_boost: 0.60, style: 0.65 },
  'cleopatra':           { voiceId: V_DOMI,    stability: 0.25, similarity_boost: 0.70, style: 0.80 },
};

// ---------------------------------------------------------------------------
// Archetype settings — fallback for figures without overrides
// ---------------------------------------------------------------------------

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
// Fallback voice pools by nationality/accent (for unmapped figures)
// ---------------------------------------------------------------------------

const VOICES_BRITISH_MALE  = [V_ANTONI, V_SAM];
const VOICES_DEEP_MALE     = [V_ARNOLD, V_ADAM];
const VOICES_WARM_MALE     = [V_JOSH, V_SAM, V_ANTONI];
const VOICES_ENERGETIC_MALE = [V_JOSH, V_ARNOLD];
const VOICES_FEMALE_WARM   = [V_RACHEL, V_BELLA, V_ELLI];
const VOICES_FEMALE_STRONG = [V_DOMI, V_RACHEL];
const VOICES_NARRATOR      = [V_ADAM, V_RACHEL];

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
  categories: string[],
  nationality?: string
): VoiceProfile {
  // Check for per-figure override first
  const override = FIGURE_VOICE_OVERRIDES[figureId];
  if (override) {
    return {
      figureId,
      elevenLabsVoiceId: override.voiceId,
      voiceSettings: {
        stability: override.stability,
        similarity_boost: override.similarity_boost,
        style: override.style,
        use_speaker_boost: true,
      },
      pitchAdjustment: voicePersonality,
    };
  }

  // Fallback: archetype + nationality-based voice selection
  const archetype = detectArchetype(voicePersonality, categories);
  const settings = ARCHETYPE_SETTINGS[archetype];
  const isFemale = KNOWN_FEMALE_IDS.has(figureId);
  const nat = (nationality ?? '').toLowerCase();
  const isBritish = nat.includes('british') || nat.includes('english') || nat.includes('scottish') || nat.includes('irish');

  let voiceId: string;
  if (isFemale) {
    if (archetype === 'passionate-orator' || archetype === 'comedian') {
      voiceId = pickFromArray(VOICES_FEMALE_STRONG, figureId);
    } else {
      voiceId = pickFromArray(VOICES_FEMALE_WARM, figureId);
    }
  } else if (isBritish) {
    voiceId = pickFromArray(VOICES_BRITISH_MALE, figureId);
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

/**
 * Get voice settings tuned for a figure's personality archetype.
 * Used with dynamically discovered voices (from voiceDiscovery.ts).
 */
export function getVoiceSettingsForPersonality(
  voicePersonality: string,
  categories: string[]
): { stability: number; similarity_boost: number; style: number; use_speaker_boost: boolean } {
  const archetype = detectArchetype(voicePersonality, categories);
  const settings = ARCHETYPE_SETTINGS[archetype];
  return { ...settings, use_speaker_boost: true };
}

// ---------------------------------------------------------------------------
// Web Speech API fallback
// ---------------------------------------------------------------------------

export function getWebSpeechVoice(
  nationality: string,
  voicePersonality: string,
  figureId?: string
): { lang: string; pitch: number; rate: number; voiceIndex: number } {
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

  // Base pitch/rate from personality — keep variations subtle
  let pitch = 1.0;
  let rate = 1.0;

  if (vp.includes('deep') || vp.includes('gravelly') || vp.includes('bass')) pitch = 0.9;
  if (vp.includes('high') || vp.includes('bright')) pitch = 1.1;
  if (vp.includes('slow') || vp.includes('deliberate') || vp.includes('measured')) rate = 0.95;
  if (vp.includes('rapid') || vp.includes('fast')) rate = 1.1;

  // Per-figure hash-based variation — subtle so voices differ without sounding broken
  const hash = figureId ? hashCode(figureId) : 0;
  const pitchOffset = ((hash % 5) - 2) * 0.04;   // -0.08 to +0.08
  const rateOffset = (((hash >> 4) % 5) - 2) * 0.03; // -0.06 to +0.06
  pitch = Math.max(0.85, Math.min(1.15, pitch + pitchOffset));
  rate = Math.max(0.9, Math.min(1.15, rate + rateOffset));

  // voiceIndex: used to pick different browser voices from the available list
  const voiceIndex = hash % 20;

  return { lang, pitch, rate, voiceIndex };
}
