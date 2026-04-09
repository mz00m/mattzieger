import type { HistoricalFigure } from './figures';
import { FIGURES } from './figures';

// In-memory store for custom figures (persists across requests in the same server instance)
// In production, this would be backed by a database like Vercel KV
const customFigures: HistoricalFigure[] = [];

export function getCustomFigures(): HistoricalFigure[] {
  return [...customFigures];
}

export function getAllFigures(): HistoricalFigure[] {
  return [...FIGURES, ...customFigures];
}

export function addCustomFigure(figure: HistoricalFigure): void {
  // Don't add duplicates
  if (
    customFigures.some((f) => f.id === figure.id) ||
    FIGURES.some((f) => f.id === figure.id)
  ) {
    return;
  }
  customFigures.push(figure);
}

export function findFigureById(id: string): HistoricalFigure | undefined {
  return (
    FIGURES.find((f) => f.id === id) ||
    customFigures.find((f) => f.id === id)
  );
}

export async function generateCustomFigure(
  name: string
): Promise<HistoricalFigure> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-latest',
      max_tokens: 2048,
      system: `You are creating a character profile for a dinner party simulation app. Given a person's name, create a detailed profile. Return ONLY valid JSON matching this exact structure (no markdown, no preamble):

{
  "id": "lowercase-kebab-case-name",
  "name": "Full Name",
  "born": "birth year or approximate",
  "died": "death year if applicable, omit field if living",
  "category": ["one or more categories from: Philosophy, Science, Literature, Politics, Civil Rights, Comedy, Music, Art, Technology, Economics, Religion & Mysticism, Exploration, Film & Theater, Modern Thinkers"],
  "nationality": "nationality",
  "tagline": "One sharp, memorable sentence about them",
  "knownFor": ["3-5 bullet facts"],
  "writingStyle": "1-2 sentences about how they spoke and wrote - be specific about rhetorical patterns",
  "voicePersonality": "Brief voice character description for text-to-speech",
  "wikiSlug": "Wikipedia_Article_Slug",
  "primarySources": ["2-4 key works, speeches, or books"],
  "imagePrompt": "Brief visual description for avatar generation"
}`,
      messages: [
        {
          role: 'user',
          content: `Create a detailed character profile for: ${name}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to generate figure: ${error}`);
  }

  const data = await response.json();
  const content = data.content[0]?.text;

  if (!content) {
    throw new Error('Empty response from AI');
  }

  // Parse the JSON response
  const figure: HistoricalFigure = JSON.parse(content);

  // Ensure the ID is valid
  figure.id =
    figure.id ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  return figure;
}
