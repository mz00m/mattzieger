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
// ---------------------------------------------------------------------------

// Male voices
const V_ANTONI  = 'ErXwobaYiN019PkySvjV';  // Well-rounded, calm
const V_ARNOLD  = 'VR6AewLTigWG4xSOukaG';  // Deep, authoritative
const V_ADAM    = 'pNInz6obpgDQGcFmaJgB';  // Deep narration
const V_JOSH    = 'TxGEqnHWrfWFTfGW9XjX';  // Warm, conversational
const V_SAM     = 'yoZ06aMxZJJ28mfd3POQ';  // Warm, narrative
const V_JAMES   = 'ZQe5CZNOzWyzPSCn5a3c';  // Calm, authoritative
const V_DANIEL  = 'onwK4e9ZLuTAKqWW03F9';  // British, measured
const V_CALLUM  = 'N2lVS1w4EtoT3dr4eOWO';  // British, lively
const V_CLYDE   = '2EiwWnXFnvU5JabPnv8n';  // Deep, gruff
const V_ETHAN   = 'g5CIjZEefAph4nQFvHAz';  // Young, energetic
const V_FIN     = 'D38z5RcWu1voky8WS1ja';  // Irish, smooth
const V_HARRY   = 'SOYHLrjzK2X1ezoPC6cr';  // British, young
const V_JOSEPH  = 'Zlb1dXrM653N07WRdFW3';  // British, middle-aged
const V_LIAM    = 'TX3LPaxmHKxFdv7VOQHJ';  // Young American
const V_MICHAEL = 'flq6f7yk4E4fJM5XTYuZ';  // Older American
const V_PATRICK = 'ODq5zmih8GrVes37Dizd';  // Middle-aged American
const V_THOMAS  = 'GBv7mTt0atIp3Br8iCZE';  // Calm American

// Female voices
const V_RACHEL  = '21m00Tcm4TlvDq8ikWAM';  // Calm, warm
const V_BELLA   = 'EXAVITQu4vr4xnSDxMaL';  // Soft, gentle
const V_EMILY   = 'MF3mGyEYCl7XYWbV9V6O';  // Calm, gentle
const V_DOROTHY = 'ThT5KcBeYPX3keUQqHPh';  // Pleasant, warm
const V_DOMI    = 'AZnzlk1XvdvUeBnXmlld';  // Strong, confident
const V_FREYA   = 'jsCqWAovK2LkecY7zXl4';  // Nordic, strong
const V_LILY    = 'pFZP5JQG7iQjIQuC4Bku';  // British female
const V_GLINDA  = 'z9fAnlkpzviPz146aGWa';  // Warm, theatrical
const V_JESSIE  = 't0jbNlBVZ17f02VDIeMI';  // Raspy, intense

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

const FIGURE_VOICE_OVERRIDES: Record<string, VoiceOverride> = {
  // === PHILOSOPHY ===
  'socrates':            { voiceId: V_JOSH,    stability: 0.40, similarity_boost: 0.60, style: 0.50 }, // Warm questioner
  'plato':               { voiceId: V_JAMES,   stability: 0.45, similarity_boost: 0.60, style: 0.45 }, // Dignified, measured
  'aristotle':           { voiceId: V_PATRICK,  stability: 0.45, similarity_boost: 0.60, style: 0.40 }, // Professorial
  'nietzsche':           { voiceId: V_CLYDE,   stability: 0.20, similarity_boost: 0.60, style: 0.90 }, // Intense, dramatic
  'simone-de-beauvoir':  { voiceId: V_RACHEL,  stability: 0.30, similarity_boost: 0.65, style: 0.70 }, // Intellectual, passionate
  'hannah-arendt':       { voiceId: V_EMILY,   stability: 0.40, similarity_boost: 0.60, style: 0.55 }, // Precise, measured
  'bertrand-russell':    { voiceId: V_DANIEL,  stability: 0.40, similarity_boost: 0.60, style: 0.50 }, // British, wry
  'simone-weil':         { voiceId: V_BELLA,   stability: 0.45, similarity_boost: 0.55, style: 0.40 }, // Quiet intensity
  'albert-camus':        { voiceId: V_SAM,     stability: 0.35, similarity_boost: 0.60, style: 0.60 }, // Warm, Mediterranean
  'lao-tzu':             { voiceId: V_THOMAS,  stability: 0.55, similarity_boost: 0.50, style: 0.35 }, // Serene, unhurried
  'confucius':           { voiceId: V_JAMES,   stability: 0.50, similarity_boost: 0.55, style: 0.40 }, // Dignified elder
  'ibn-rushd':           { voiceId: V_ADAM,    stability: 0.45, similarity_boost: 0.60, style: 0.45 }, // Scholarly warmth
  'mary-wollstonecraft': { voiceId: V_DOMI,   stability: 0.30, similarity_boost: 0.65, style: 0.75 }, // Passionate, direct
  'john-stuart-mill':    { voiceId: V_JOSEPH,  stability: 0.45, similarity_boost: 0.55, style: 0.40 }, // Measured Victorian
  'immanuel-kant':       { voiceId: V_MICHAEL, stability: 0.50, similarity_boost: 0.55, style: 0.30 }, // Precise monotone
  'sigmund-freud':       { voiceId: V_ARNOLD,  stability: 0.40, similarity_boost: 0.60, style: 0.55 }, // Deep, probing
  'noam-chomsky':        { voiceId: V_PATRICK, stability: 0.45, similarity_boost: 0.55, style: 0.40 }, // Measured, precise

  // === SCIENCE ===
  'marie-curie':         { voiceId: V_RACHEL,  stability: 0.45, similarity_boost: 0.55, style: 0.40 }, // Quiet determination
  'richard-feynman':     { voiceId: V_JOSH,    stability: 0.20, similarity_boost: 0.60, style: 0.90 }, // Enthusiastic New Yorker
  'charles-darwin':      { voiceId: V_CALLUM,  stability: 0.45, similarity_boost: 0.55, style: 0.40 }, // Gentle British
  'ada-lovelace':        { voiceId: V_LILY,    stability: 0.40, similarity_boost: 0.60, style: 0.60 }, // Victorian British
  'alan-turing':         { voiceId: V_HARRY,   stability: 0.50, similarity_boost: 0.50, style: 0.35 }, // Shy, British
  'nikola-tesla':        { voiceId: V_ANTONI,  stability: 0.25, similarity_boost: 0.60, style: 0.80 }, // Intense visionary
  'albert-einstein':     { voiceId: V_ANTONI,  stability: 0.40, similarity_boost: 0.60, style: 0.55 }, // Warm, avuncular
  'carl-sagan':          { voiceId: V_ADAM,    stability: 0.30, similarity_boost: 0.65, style: 0.75 }, // Rich baritone, awe
  'rachel-carson':       { voiceId: V_DOROTHY, stability: 0.40, similarity_boost: 0.60, style: 0.55 }, // Gentle, measured
  'rosalind-franklin':   { voiceId: V_EMILY,   stability: 0.45, similarity_boost: 0.55, style: 0.45 }, // Direct, precise
  'neil-degrasse-tyson': { voiceId: V_ARNOLD,  stability: 0.25, similarity_boost: 0.65, style: 0.85 }, // Deep, enthusiastic
  'stephen-hawking':     { voiceId: V_DANIEL,  stability: 0.60, similarity_boost: 0.50, style: 0.30 }, // Measured, careful
  'isaac-newton':        { voiceId: V_JOSEPH,  stability: 0.50, similarity_boost: 0.55, style: 0.35 }, // Precise, British

  // === LITERATURE ===
  'shakespeare':         { voiceId: V_CALLUM,  stability: 0.25, similarity_boost: 0.60, style: 0.85 }, // Theatrical British
  'jane-austen':         { voiceId: V_DOROTHY, stability: 0.40, similarity_boost: 0.60, style: 0.60 }, // Proper, witty
  'mark-twain':          { voiceId: V_SAM,     stability: 0.25, similarity_boost: 0.60, style: 0.80 }, // Warm storyteller
  'virginia-woolf':      { voiceId: V_BELLA,   stability: 0.35, similarity_boost: 0.60, style: 0.65 }, // Lyrical, flowing
  'james-baldwin':       { voiceId: V_LIAM,    stability: 0.30, similarity_boost: 0.65, style: 0.80 }, // Passionate, direct
  'toni-morrison':       { voiceId: V_DOMI,    stability: 0.30, similarity_boost: 0.65, style: 0.75 }, // Commanding storyteller
  'oscar-wilde':         { voiceId: V_CALLUM,  stability: 0.25, similarity_boost: 0.60, style: 0.90 }, // Witty, theatrical British
  'george-orwell':       { voiceId: V_DANIEL,  stability: 0.40, similarity_boost: 0.60, style: 0.50 }, // Crisp British
  'david-foster-wallace':{ voiceId: V_ETHAN,   stability: 0.25, similarity_boost: 0.55, style: 0.75 }, // Rapid, digressive
  'zora-neale-hurston':  { voiceId: V_GLINDA,  stability: 0.30, similarity_boost: 0.60, style: 0.75 }, // Warm, Southern
  'franz-kafka':         { voiceId: V_THOMAS,  stability: 0.45, similarity_boost: 0.50, style: 0.40 }, // Quiet, unsettling
  'jorge-luis-borges':   { voiceId: V_FIN,     stability: 0.40, similarity_boost: 0.55, style: 0.55 }, // Smooth, literary
  'fyodor-dostoevsky':   { voiceId: V_CLYDE,   stability: 0.30, similarity_boost: 0.55, style: 0.70 }, // Deep, tormented
  'octavia-butler':      { voiceId: V_JESSIE,  stability: 0.35, similarity_boost: 0.60, style: 0.65 }, // Intense, visionary
  'emily-dickinson':     { voiceId: V_BELLA,   stability: 0.50, similarity_boost: 0.55, style: 0.45 }, // Quiet, precise
  'mary-shelley':        { voiceId: V_LILY,    stability: 0.35, similarity_boost: 0.60, style: 0.60 }, // Gothic British
  'maya-angelou':        { voiceId: V_DOMI,    stability: 0.30, similarity_boost: 0.65, style: 0.80 }, // Strong, poetic

  // === POLITICS & CIVIL RIGHTS ===
  'frederick-douglass':  { voiceId: V_ADAM,    stability: 0.30, similarity_boost: 0.65, style: 0.80 }, // Deep, powerful orator
  'harriet-tubman':      { voiceId: V_FREYA,   stability: 0.35, similarity_boost: 0.60, style: 0.70 }, // Strong, determined
  'martin-luther-king-jr': { voiceId: V_ARNOLD, stability: 0.25, similarity_boost: 0.70, style: 0.90 }, // Deep, soaring oratory
  'malcolm-x':           { voiceId: V_CLYDE,   stability: 0.25, similarity_boost: 0.65, style: 0.85 }, // Sharp, intense
  'nelson-mandela':      { voiceId: V_JAMES,   stability: 0.35, similarity_boost: 0.65, style: 0.65 }, // Dignified, warm
  'mahatma-gandhi':      { voiceId: V_THOMAS,  stability: 0.45, similarity_boost: 0.55, style: 0.45 }, // Gentle, unwavering
  'eleanor-roosevelt':   { voiceId: V_DOROTHY, stability: 0.40, similarity_boost: 0.60, style: 0.55 }, // Dignified, warm
  'winston-churchill':   { voiceId: V_JOSEPH,  stability: 0.30, similarity_boost: 0.65, style: 0.80 }, // British, commanding
  'ida-b-wells':         { voiceId: V_JESSIE,  stability: 0.30, similarity_boost: 0.65, style: 0.75 }, // Fierce, relentless
  'sojourner-truth':     { voiceId: V_FREYA,   stability: 0.30, similarity_boost: 0.65, style: 0.80 }, // Powerful, spiritual
  'angela-davis':        { voiceId: V_DOMI,    stability: 0.25, similarity_boost: 0.65, style: 0.85 }, // Fierce, intellectual
  'abraham-lincoln':     { voiceId: V_MICHAEL, stability: 0.40, similarity_boost: 0.60, style: 0.50 }, // Folksy, measured
  'barack-obama':        { voiceId: V_JOSH,    stability: 0.35, similarity_boost: 0.65, style: 0.70 }, // Warm, measured charisma

  // === COMEDY ===
  'george-carlin':       { voiceId: V_ETHAN,   stability: 0.15, similarity_boost: 0.55, style: 0.95 }, // Rapid, punchy
  'richard-pryor':       { voiceId: V_LIAM,    stability: 0.20, similarity_boost: 0.55, style: 0.90 }, // Energetic, vulnerable
  'robin-williams':      { voiceId: V_CALLUM,  stability: 0.10, similarity_boost: 0.55, style: 0.95 }, // Manic, shapeshifting
  'joan-rivers':         { voiceId: V_JESSIE,  stability: 0.15, similarity_boost: 0.55, style: 0.95 }, // Rapid, sharp
  'lenny-bruce':         { voiceId: V_FIN,     stability: 0.20, similarity_boost: 0.55, style: 0.85 }, // Cool, provocative
  'moms-mabley':         { voiceId: V_GLINDA,  stability: 0.25, similarity_boost: 0.55, style: 0.85 }, // Warm, folksy
  'bill-hicks':          { voiceId: V_CLYDE,   stability: 0.20, similarity_boost: 0.55, style: 0.90 }, // Intense, Southern growl
  'nora-ephron':         { voiceId: V_EMILY,   stability: 0.30, similarity_boost: 0.60, style: 0.75 }, // Witty, conversational
  'phyllis-diller':      { voiceId: V_GLINDA,  stability: 0.15, similarity_boost: 0.55, style: 0.95 }, // Wild, cackling

  // === MUSIC ===
  'mozart':              { voiceId: V_HARRY,   stability: 0.20, similarity_boost: 0.55, style: 0.85 }, // Young, manic
  'beethoven':           { voiceId: V_ARNOLD,  stability: 0.30, similarity_boost: 0.60, style: 0.70 }, // Deep, passionate
  'louis-armstrong':     { voiceId: V_SAM,     stability: 0.25, similarity_boost: 0.60, style: 0.80 }, // Warm, gravelly
  'nina-simone':         { voiceId: V_JESSIE,  stability: 0.25, similarity_boost: 0.65, style: 0.80 }, // Raw, intense
  'bob-dylan':           { voiceId: V_FIN,     stability: 0.35, similarity_boost: 0.50, style: 0.60 }, // Cryptic, nasal drawl
  'billie-holiday':      { voiceId: V_BELLA,   stability: 0.30, similarity_boost: 0.65, style: 0.75 }, // Smoky, vulnerable
  'miles-davis':         { voiceId: V_CLYDE,   stability: 0.40, similarity_boost: 0.50, style: 0.50 }, // Cool, minimal
  'freddie-mercury':     { voiceId: V_CALLUM,  stability: 0.15, similarity_boost: 0.60, style: 0.95 }, // Theatrical, flamboyant
  'johnny-cash':         { voiceId: V_ADAM,    stability: 0.40, similarity_boost: 0.60, style: 0.55 }, // Deep, steady bass
  'aretha-franklin':     { voiceId: V_DOMI,    stability: 0.25, similarity_boost: 0.65, style: 0.85 }, // Powerful, soulful
  'david-bowie':         { voiceId: V_DANIEL,  stability: 0.20, similarity_boost: 0.60, style: 0.85 }, // British, chameleonic
  'leonard-cohen':       { voiceId: V_MICHAEL, stability: 0.40, similarity_boost: 0.55, style: 0.55 }, // Deep, measured poetry
  'patti-smith':         { voiceId: V_FREYA,   stability: 0.25, similarity_boost: 0.60, style: 0.80 }, // Raw, punk energy

  // === TECHNOLOGY ===
  'steve-jobs':          { voiceId: V_PATRICK, stability: 0.30, similarity_boost: 0.65, style: 0.80 }, // Intense, visionary
  'grace-hopper':        { voiceId: V_DOROTHY, stability: 0.35, similarity_boost: 0.60, style: 0.65 }, // No-nonsense, sharp
  'tim-berners-lee':     { voiceId: V_DANIEL,  stability: 0.45, similarity_boost: 0.55, style: 0.40 }, // Quiet British
  'aaron-swartz':        { voiceId: V_ETHAN,   stability: 0.35, similarity_boost: 0.55, style: 0.65 }, // Young, passionate
  'buckminster-fuller':  { voiceId: V_SAM,     stability: 0.25, similarity_boost: 0.55, style: 0.70 }, // Energetic visionary

  // === MODERN THINKERS ===
  'christopher-hitchens': { voiceId: V_JOSEPH,  stability: 0.25, similarity_boost: 0.65, style: 0.85 }, // British, devastating
  'susan-sontag':        { voiceId: V_RACHEL,  stability: 0.35, similarity_boost: 0.60, style: 0.65 }, // Intellectual, commanding
  'bell-hooks':          { voiceId: V_EMILY,   stability: 0.35, similarity_boost: 0.60, style: 0.65 }, // Warm, accessible
  'cornel-west':         { voiceId: V_ARNOLD,  stability: 0.20, similarity_boost: 0.65, style: 0.90 }, // Rhythmic, jazzy preacher
  'ta-nehisi-coates':    { voiceId: V_LIAM,    stability: 0.35, similarity_boost: 0.60, style: 0.65 }, // Thoughtful, lyrical
  'roxane-gay':          { voiceId: V_DOMI,    stability: 0.35, similarity_boost: 0.60, style: 0.65 }, // Direct, honest
  'malcolm-gladwell':    { voiceId: V_FIN,     stability: 0.30, similarity_boost: 0.60, style: 0.70 }, // Smooth storyteller
  'yuval-noah-harari':   { voiceId: V_ANTONI,  stability: 0.40, similarity_boost: 0.55, style: 0.50 }, // Clear, panoramic
  'brene-brown':         { voiceId: V_GLINDA,  stability: 0.30, similarity_boost: 0.60, style: 0.70 }, // Warm, Southern
  'frida-kahlo':         { voiceId: V_JESSIE,  stability: 0.25, similarity_boost: 0.65, style: 0.80 }, // Intense, passionate
  'leonardo-da-vinci':   { voiceId: V_FIN,     stability: 0.35, similarity_boost: 0.60, style: 0.60 }, // Curious polymath

  // === OTHER ===
  'adam-smith':          { voiceId: V_DANIEL,  stability: 0.45, similarity_boost: 0.55, style: 0.40 }, // Scottish, measured
  'karl-marx':           { voiceId: V_ARNOLD,  stability: 0.30, similarity_boost: 0.60, style: 0.75 }, // Deep, forceful
  'rumi':                { voiceId: V_THOMAS,  stability: 0.40, similarity_boost: 0.55, style: 0.60 }, // Mystic, flowing
  'amelia-earhart':      { voiceId: V_FREYA,   stability: 0.35, similarity_boost: 0.60, style: 0.65 }, // Bold, adventurous
  'cleopatra':           { voiceId: V_DOMI,    stability: 0.30, similarity_boost: 0.65, style: 0.75 }, // Commanding, regal
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

const VOICES_BRITISH_MALE  = [V_DANIEL, V_CALLUM, V_JOSEPH, V_HARRY];
const VOICES_DEEP_MALE     = [V_ARNOLD, V_ADAM, V_CLYDE];
const VOICES_WARM_MALE     = [V_JOSH, V_SAM, V_THOMAS, V_PATRICK];
const VOICES_ENERGETIC_MALE = [V_ETHAN, V_LIAM, V_FIN];
const VOICES_FEMALE_WARM   = [V_RACHEL, V_BELLA, V_EMILY, V_DOROTHY];
const VOICES_FEMALE_STRONG = [V_DOMI, V_FREYA, V_JESSIE, V_LILY];
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
