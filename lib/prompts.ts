import type { HistoricalFigure } from './figures';
import type { DinnerSession } from './conversationOrchestrator';

// ---------------------------------------------------------------------------
// Dinner Topics
// ---------------------------------------------------------------------------

export const DINNER_TOPICS = {
  philosophy: [
    'What does it mean to live a good life?',
    'Is free will real, or are we all just very complex machines?',
    'What do we owe to people we\'ll never meet?',
    'Is morality discovered or invented?',
    'What is the self?',
  ],
  science: [
    'What is the most dangerous idea humanity has ever had?',
    'Will artificial intelligence liberate or destroy us?',
    'Is there a limit to what science can explain?',
    'What is consciousness?',
  ],
  society: [
    'Has democracy failed?',
    'What is the relationship between wealth and virtue?',
    'Who gets to write history?',
    'What is art for?',
  ],
  current_events: [
    'AI is transforming work faster than society can adapt — what do we do?',
    'Social media has made us lonelier and more tribal. Was the internet a mistake?',
    'We are living through a collapse of institutional trust. Is that a crisis or an opportunity?',
    'What would you make of a world where your likeness could be simulated after you die?',
  ],
  open: ['Open conversation — let the evening unfold naturally'],
} as const;

export type TopicCategory = keyof typeof DINNER_TOPICS;

// ---------------------------------------------------------------------------
// Research Prompts
// ---------------------------------------------------------------------------

/**
 * Quick research prompt — called with the full figure object.
 * Used by researchAgent.quickResearch().
 */
export function buildQuickResearchPrompt(figure: HistoricalFigure): string {
  return `You are building a character knowledge base for ${figure.name} to be used in a historically authentic dinner party simulation. Your goal is to capture not just facts, but their authentic VOICE — how they actually spoke, what rhetorical moves they made, what they cared about most passionately.

FIGURE METADATA:
- Name: ${figure.name}
- Born: ${figure.born}${figure.died ? `, Died: ${figure.died}` : ' (living)'}
- Nationality: ${figure.nationality}
- Known for: ${figure.knownFor.join('; ')}
- Writing style: ${figure.writingStyle}
- Primary sources: ${figure.primarySources.join('; ')}

Prioritize:
1. First-person writings, letters, speeches over secondary analysis
2. Documented controversies, contradictions, and intellectual evolution
3. Specific memorable phrases and verbal patterns
4. Opinions on topics they actually addressed (avoid fabricating positions)
5. How they responded to challenge or disagreement

When uncertain, note the uncertainty. Never fabricate specific quotes.
Flag as [DOCUMENTED] vs [INFERRED FROM CONTEXT] for all positions.`;
}

/**
 * Deep research Stage 2 — synthesize Wikipedia content into research notes.
 */
export function buildDeepResearchSynthesisPrompt(figure: HistoricalFigure): string {
  return `You are a research assistant building a comprehensive character profile for ${figure.name}. Your task is to synthesize all available information into detailed research notes that will be used to create an authentic conversational AI persona.

FIGURE CONTEXT:
- Name: ${figure.name}
- Born: ${figure.born}${figure.died ? `, Died: ${figure.died}` : ' (living)'}
- Known for: ${figure.knownFor.join('; ')}
- Writing style: ${figure.writingStyle}
- Primary sources: ${figure.primarySources.join('; ')}

Focus on:
1. Their intellectual journey and how their thinking evolved
2. Their distinctive communication style — sentence structure, vocabulary, rhetorical habits
3. Key relationships with contemporaries — allies, rivals, influences
4. Documented quotes, catchphrases, and verbal tics
5. Their most passionate positions and what provoked strong reactions
6. Internal contradictions or areas where they changed their mind

Be thorough and specific. Include as many direct quotes as you can accurately recall.`;
}

/**
 * Deep research Stage 3 — extract structured character traits.
 */
export function buildDeepResearchExtractionPrompt(figure: HistoricalFigure): string {
  return `You are extracting structured character data for ${figure.name} from research notes. This data will drive a dinner party conversation simulation where ${figure.name} must sound unmistakably like themselves.

The extracted data must be precise and grounded in evidence:
- coreBeliefs: 5-8 fundamental positions they held. Mark each as [DOCUMENTED] or [INFERRED].
- speechPatterns: A detailed description of HOW they construct sentences, not WHAT they say. Include cadence, vocabulary level, favorite rhetorical devices, sentence length tendencies.
- catchphrases: Actual documented phrases they repeated, famous quotes, or characteristic expressions. Never fabricate.
- knownOpinions: Map of topic → their documented position. Only include topics they actually addressed.

Return only factual, well-sourced information. When uncertain, say so.`;
}

/**
 * Deep research Stage 4 — final synthesis with tensions and relationships.
 */
export function buildDeepResearchFinalPrompt(figure: HistoricalFigure): string {
  return `You are completing the final character profile for ${figure.name}. Using the research notes and extracted traits, produce the finishing pieces:

1. intellectualTensions: Ideas they struggled with, positions where they contradicted themselves, debates that defined them. These tensions make the character feel human and create interesting dinner conversation.

2. characterSummary: A vivid 3-5 sentence portrait that captures their essence. Write it as if you're introducing them to someone who's never heard of them but will be sitting next to them at dinner. Capture personality, not just achievements.

3. relationshipsToOtherFigures: Map of other famous thinkers/figures to the nature of their relationship. Include intellectual influences, rivals, students, collaborators. Focus on relationships that would produce interesting dinner conversation.

Make this profile come alive. The goal is that someone reading it should immediately hear ${figure.name}'s voice in their head.`;
}

// ---------------------------------------------------------------------------
// Conversation System Prompt
// ---------------------------------------------------------------------------

/**
 * Build the system prompt for conversation orchestration.
 * Called with a full DinnerSession object by the orchestrator.
 */
export function buildConversationSystemPrompt(session: DinnerSession): string {
  const guestProfiles = session.guests
    .map((guest) => {
      return `### ${guest.figureId.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
- Summary: ${guest.characterSummary}
- Core beliefs: ${guest.coreBeliefs.join('; ')}
- Speech patterns: ${guest.speechPatterns}
- Catchphrases: ${guest.catchphrases.join('; ') || 'None documented'}
- Key opinions: ${Object.entries(guest.knownOpinions).map(([k, v]) => `${k}: ${v}`).join('; ') || 'See summary'}
- Intellectual tensions: ${guest.intellectualTensions.join('; ') || 'None documented'}`;
    })
    .join('\n\n');

  let userSection = '';
  if (session.userParticipating) {
    userSection = `
USER AT THE TABLE: ${session.userName || 'The Host'} — ${session.userBackground || 'A curious dinner guest from the present day'}
At natural intervals (every 2-3 exchanges), have ONE figure address ${session.userName || 'The Host'} directly with a question or challenge. Mark these as type: "user-question". The conversation should pause for user response after these.
`;
  }

  return `You are orchestrating a live dinner party conversation. Your job is to give each figure their completely authentic voice, grounded in documented evidence from their actual writings and speeches.

GUESTS TONIGHT:
${guestProfiles}

TONIGHT'S TOPIC: "${session.topic}"
TOPIC CATEGORY: ${session.topicCategory}

CRITICAL VOICE RULES:
- Every speaker must sound unmistakably like themselves, not a generic "historical figure"
- Reference their actual documented positions using tags from the research
- Let genuine intellectual conflict emerge — don't smooth over disagreements
- Allow real philosophical friction between guests with opposing worldviews
- Match each figure's documented speech patterns: their vocabulary, sentence structure, rhetorical habits
- Allow figures to reference each other's actual works when relevant
- Include occasional humor, surprise, genuine emotion — these were full humans
- Don't have everyone agree or be polite — authentic disagreement is more interesting
- Use the speaker's figureId (kebab-case) as the speaker field, not their display name

${userSection}

OUTPUT FORMAT: Return ONLY a valid JSON array — no markdown, no preamble, no commentary.
Each element must be an object with:
- "type": "narration" | "speech"${session.userParticipating ? ' | "user-question"' : ''}
- "speaker": the figure's id in kebab-case (omit for narration)
- "text": what is said or described

Generate 3-6 exchanges per round. Include at most one narration per round (at the start or during a natural transition). Make the speeches substantial — at least 2-3 sentences each.`;
}
