import { HistoricalFigure } from './figures';
import {
  buildQuickResearchPrompt,
  buildDeepResearchSynthesisPrompt,
  buildDeepResearchExtractionPrompt,
  buildDeepResearchFinalPrompt,
} from './prompts';

export interface CharacterKnowledgeBase {
  figureId: string;
  researchDepth: 'quick' | 'deep';
  characterSummary: string;
  coreBeliefs: string[];
  speechPatterns: string;
  catchphrases: string[];
  knownOpinions: Record<string, string>;
  intellectualTensions: string[];
  relationshipsToOtherFigures: Record<string, string>;
  rawResearchNotes: string;
  generatedAt: Date;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

async function callClaude(
  systemPrompt: string,
  messages: ClaudeMessage[],
  maxTokens = 4096
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'unknown error');
    throw new Error(
      `Claude API request failed (${response.status}): ${errorBody}`
    );
  }

  const data = await response.json();

  // Extract text from the first content block
  const textBlock = data?.content?.find(
    (block: { type: string }) => block.type === 'text'
  );
  if (!textBlock) {
    throw new Error('No text content in Claude response');
  }

  return textBlock.text as string;
}

/**
 * Attempt to parse a JSON string that may be wrapped in markdown code fences.
 */
function parseJsonResponse<T>(raw: string): T {
  // Strip optional ```json ... ``` wrapper
  const stripped = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  return JSON.parse(stripped) as T;
}

/**
 * Build a fallback CharacterKnowledgeBase when an API call fails so the app
 * can still render something useful.
 */
function buildFallbackKnowledgeBase(
  figure: HistoricalFigure,
  depth: 'quick' | 'deep'
): CharacterKnowledgeBase {
  return {
    figureId: figure.id,
    researchDepth: depth,
    characterSummary: `${figure.name}: ${figure.tagline}`,
    coreBeliefs: figure.knownFor ?? [],
    speechPatterns: figure.writingStyle ?? 'Formal and articulate',
    catchphrases: [],
    knownOpinions: {},
    intellectualTensions: [],
    relationshipsToOtherFigures: {},
    rawResearchNotes: '',
    generatedAt: new Date(),
  };
}

// ---------------------------------------------------------------------------
// Quick research – single Claude call using built-in metadata
// ---------------------------------------------------------------------------

export async function quickResearch(
  figure: HistoricalFigure
): Promise<CharacterKnowledgeBase> {
  try {
    const systemPrompt = buildQuickResearchPrompt(figure);

    const userMessage = [
      `Build a comprehensive character knowledge base for ${figure.name}.`,
      '',
      'Return your response as a single JSON object with the following fields:',
      '- figureId (string)',
      '- researchDepth ("quick")',
      '- characterSummary (string – a vivid 2-3 sentence portrait)',
      '- coreBeliefs (string[])',
      '- speechPatterns (string – describe how they talk)',
      '- catchphrases (string[] – famous quotes or recurring phrases)',
      '- knownOpinions (Record<string, string> – topic → opinion)',
      '- intellectualTensions (string[] – internal contradictions or debates they spark)',
      '- relationshipsToOtherFigures (Record<string, string> – name → relationship)',
      '- rawResearchNotes (string – any extra context)',
      '',
      'Return ONLY valid JSON, no markdown fences or commentary.',
    ].join('\n');

    const raw = await callClaude(systemPrompt, [
      { role: 'user', content: userMessage },
    ]);

    const parsed = parseJsonResponse<Partial<CharacterKnowledgeBase>>(raw);

    return {
      figureId: figure.id,
      researchDepth: 'quick',
      characterSummary: parsed.characterSummary ?? `${figure.name}: ${figure.tagline}`,
      coreBeliefs: parsed.coreBeliefs ?? [],
      speechPatterns: parsed.speechPatterns ?? '',
      catchphrases: parsed.catchphrases ?? [],
      knownOpinions: parsed.knownOpinions ?? {},
      intellectualTensions: parsed.intellectualTensions ?? [],
      relationshipsToOtherFigures: parsed.relationshipsToOtherFigures ?? {},
      rawResearchNotes: parsed.rawResearchNotes ?? '',
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error(`Quick research failed for ${figure.name}:`, error);
    return buildFallbackKnowledgeBase(figure, 'quick');
  }
}

// ---------------------------------------------------------------------------
// Deep research – multi-stage pipeline with Wikipedia + Claude
// ---------------------------------------------------------------------------

export async function deepResearch(
  figure: HistoricalFigure,
  onProgress?: (stage: string, progress: number) => void
): Promise<CharacterKnowledgeBase> {
  try {
    // ---- Stage 1: Fetch Wikipedia summary --------------------------------
    onProgress?.('Fetching Wikipedia summary', 0.1);

    let wikiContent = '';
    try {
      const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(figure.wikiSlug)}`;
      const wikiRes = await fetch(wikiUrl);
      if (wikiRes.ok) {
        const wikiData = await wikiRes.json();
        wikiContent = [
          wikiData.title ?? '',
          wikiData.description ?? '',
          wikiData.extract ?? '',
        ]
          .filter(Boolean)
          .join('\n\n');
      }
    } catch {
      // Wikipedia fetch is best-effort; continue without it.
      console.warn(`Wikipedia fetch failed for ${figure.wikiSlug}`);
    }

    onProgress?.('Wikipedia summary fetched', 0.25);

    // ---- Stage 2: Synthesize Wikipedia content into research notes --------
    onProgress?.('Synthesizing research notes', 0.3);

    const synthesisPrompt = buildDeepResearchSynthesisPrompt(figure);
    const synthesisMessage = [
      `Here is Wikipedia content about ${figure.name}:`,
      '',
      wikiContent || '(No Wikipedia content available — rely on your training data.)',
      '',
      'Synthesize this into detailed research notes covering their life, works,',
      'intellectual contributions, personality, and communication style.',
      'Return the research notes as plain text.',
    ].join('\n');

    const researchNotes = await callClaude(synthesisPrompt, [
      { role: 'user', content: synthesisMessage },
    ]);

    onProgress?.('Research notes complete', 0.5);

    // ---- Stage 3: Extract structured character traits ---------------------
    onProgress?.('Extracting character traits', 0.55);

    const extractionPrompt = buildDeepResearchExtractionPrompt(figure);
    const extractionMessage = [
      `Based on the following research notes about ${figure.name}, extract structured character data.`,
      '',
      researchNotes,
      '',
      'Return a JSON object with these fields:',
      '- coreBeliefs (string[])',
      '- speechPatterns (string)',
      '- catchphrases (string[] – famous quotes or characteristic phrases)',
      '- knownOpinions (Record<string, string> – topic → their opinion)',
      '',
      'Return ONLY valid JSON, no markdown fences or commentary.',
    ].join('\n');

    const extractionRaw = await callClaude(extractionPrompt, [
      { role: 'user', content: extractionMessage },
    ]);

    const traits = parseJsonResponse<{
      coreBeliefs?: string[];
      speechPatterns?: string;
      catchphrases?: string[];
      knownOpinions?: Record<string, string>;
    }>(extractionRaw);

    onProgress?.('Character traits extracted', 0.75);

    // ---- Stage 4: Identify tensions and produce final summary -------------
    onProgress?.('Building final character profile', 0.8);

    const finalPrompt = buildDeepResearchFinalPrompt(figure);
    const finalMessage = [
      `Using the following research notes and extracted traits for ${figure.name},`,
      'produce a final character profile.',
      '',
      '--- Research Notes ---',
      researchNotes,
      '',
      '--- Extracted Traits ---',
      JSON.stringify(traits, null, 2),
      '',
      'Return a JSON object with these fields:',
      '- intellectualTensions (string[] – internal contradictions, famous disputes, or provocative stances)',
      '- characterSummary (string – a rich 3-5 sentence portrait capturing essence, personality, and style)',
      '- relationshipsToOtherFigures (Record<string, string> – name → nature of relationship)',
      '',
      'Return ONLY valid JSON, no markdown fences or commentary.',
    ].join('\n');

    const finalRaw = await callClaude(finalPrompt, [
      { role: 'user', content: finalMessage },
    ]);

    const finalData = parseJsonResponse<{
      intellectualTensions?: string[];
      characterSummary?: string;
      relationshipsToOtherFigures?: Record<string, string>;
    }>(finalRaw);

    onProgress?.('Research complete', 1.0);

    return {
      figureId: figure.id,
      researchDepth: 'deep',
      characterSummary: finalData.characterSummary ?? `${figure.name}: ${figure.tagline}`,
      coreBeliefs: traits.coreBeliefs ?? [],
      speechPatterns: traits.speechPatterns ?? '',
      catchphrases: traits.catchphrases ?? [],
      knownOpinions: traits.knownOpinions ?? {},
      intellectualTensions: finalData.intellectualTensions ?? [],
      relationshipsToOtherFigures: finalData.relationshipsToOtherFigures ?? {},
      rawResearchNotes: researchNotes,
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error(`Deep research failed for ${figure.name}:`, error);
    onProgress?.('Research failed – using fallback', 1.0);
    return buildFallbackKnowledgeBase(figure, 'deep');
  }
}

// ---------------------------------------------------------------------------
// Batch helper – research multiple figures with concurrency control
// ---------------------------------------------------------------------------

export async function researchGuests(
  figures: HistoricalFigure[],
  depth: 'quick' | 'deep',
  onProgress?: (figureId: string, stage: string, progress: number) => void
): Promise<CharacterKnowledgeBase[]> {
  const MAX_CONCURRENT = 3;
  const results: CharacterKnowledgeBase[] = new Array(figures.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < figures.length) {
      const index = nextIndex++;
      const figure = figures[index];

      const figureProgress = onProgress
        ? (stage: string, progress: number) =>
            onProgress(figure.id, stage, progress)
        : undefined;

      results[index] =
        depth === 'deep'
          ? await deepResearch(figure, figureProgress)
          : await quickResearch(figure);
    }
  }

  // Spawn up to MAX_CONCURRENT workers
  const workers: Promise<void>[] = [];
  for (let i = 0; i < Math.min(MAX_CONCURRENT, figures.length); i++) {
    workers.push(worker());
  }

  await Promise.all(workers);

  return results;
}
