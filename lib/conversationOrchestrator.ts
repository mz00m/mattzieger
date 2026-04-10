import { CharacterKnowledgeBase } from './researchAgent';
import { buildConversationSystemPrompt } from './prompts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DinnerSession {
  id: string;
  topic: string;
  topicCategory:
    | 'philosophy'
    | 'current-events'
    | 'personal'
    | 'open'
    | 'science'
    | 'society';
  guests: CharacterKnowledgeBase[];
  userParticipating: boolean;
  userName?: string;
  userBackground?: string;
  exchanges: ConversationExchange[];
  roundNumber: number;
}

export interface ConversationExchange {
  id: string;
  type: 'narration' | 'speech' | 'user-question' | 'user-turn';
  speaker?: string;
  text: string;
  audioUrl?: string;
  voiceId?: string;
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
  const stripped = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  return JSON.parse(stripped) as T;
}

let exchangeCounter = 0;

function generateExchangeId(): string {
  // Use crypto.randomUUID when available, otherwise fall back to a counter
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  exchangeCounter += 1;
  return `exchange-${Date.now()}-${exchangeCounter}`;
}

// ---------------------------------------------------------------------------
// Session management
// ---------------------------------------------------------------------------

export function createSession(params: {
  topic: string;
  topicCategory: string;
  guests: CharacterKnowledgeBase[];
  userParticipating: boolean;
  userName?: string;
  userBackground?: string;
}): DinnerSession {
  const sessionId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  return {
    id: sessionId,
    topic: params.topic,
    topicCategory: params.topicCategory as DinnerSession['topicCategory'],
    guests: params.guests,
    userParticipating: params.userParticipating,
    userName: params.userName,
    userBackground: params.userBackground,
    exchanges: [],
    roundNumber: 0,
  };
}

// ---------------------------------------------------------------------------
// Conversation generation
// ---------------------------------------------------------------------------

/**
 * Build the message history that provides Claude with prior conversation
 * context. We pair narration/speech into assistant turns and user input
 * into user turns so the model can follow the conversation naturally.
 */
function buildConversationHistory(
  session: DinnerSession,
  action: 'start' | 'continue' | 'user-spoke',
  userInput?: string
): ClaudeMessage[] {
  const messages: ClaudeMessage[] = [];

  if (session.exchanges.length === 0 && action === 'start') {
    // Opening round – just the user message requesting the start.
    messages.push({
      role: 'user',
      content: [
        `Tonight's topic: "${session.topic}"`,
        '',
        'Start the dinner party. One short narration to set the scene (one sentence),',
        'then have the guests ease into conversation naturally — like people actually',
        'arriving at a dinner, getting comfortable, riffing off each other.',
        'Keep it casual and short. 1-2 sentences per person. No speeches.',
        'Include natural speech — laughs, interruptions, "well...", "I mean...", trailing off.',
        'Make it feel like real people talking, not characters reading lines.',
        '',
        'Return a JSON array. Each object: { "type": "narration"|"speech", "speaker": "figure-id", "text": "..." }',
        'Omit speaker for narration. Return ONLY valid JSON.',
      ].join('\n'),
    });

    return messages;
  }

  // Reconstruct conversation so far (summarised for context window)
  const prior = session.exchanges
    .map((ex) => {
      if (ex.type === 'narration') return `[Narration] ${ex.text}`;
      if (ex.type === 'speech') return `${ex.speaker}: ${ex.text}`;
      if (ex.type === 'user-question' || ex.type === 'user-turn')
        return `${session.userName ?? 'The Host'}: ${ex.text}`;
      return ex.text;
    })
    .join('\n');

  // The prior conversation is presented as the assistant's output
  if (prior) {
    messages.push({
      role: 'user',
      content: 'Here is the conversation so far:\n\n' + prior,
    });

    messages.push({
      role: 'assistant',
      content: 'Understood. I have the full conversation context.',
    });
  }

  // Now the new request
  if (action === 'user-spoke' && userInput) {
    messages.push({
      role: 'user',
      content: [
        `${session.userName ?? 'The Host'} says: "${userInput}"`,
        '',
        'Have 2-3 guests react naturally — quick responses, a laugh, a raised eyebrow,',
        'a follow-up question, someone riffing on what was said. Keep it short and real.',
        'Include natural reactions: "Ha!", "Hmm, interesting...", "Oh, that\'s —", "[laughs]".',
        'Let someone interrupt or build on what the host said.',
        '',
        'JSON array: { "type": "speech", "speaker": "figure-id", "text": "..." }',
        'Return ONLY valid JSON.',
      ].join('\n'),
    });
  } else {
    messages.push({
      role: 'user',
      content: [
        'Keep the conversation going. 4-6 short exchanges.',
        'Let it drift naturally — someone changes the angle, someone teases,',
        'someone gets curious, someone cracks a joke. Like real dinner conversation.',
        '1-2 sentences each. Include messy human stuff: laughing, trailing off,',
        '"well...", "I mean...", interrupting, reacting with just "Yes!" or "Oh come on."',
        'Mix sharp clean lines with messier natural ones.',
        '',
        'JSON array: { "type": "speech", "speaker": "figure-id", "text": "..." }',
        'Return ONLY valid JSON.',
      ].join('\n'),
    });
  }

  return messages;
}

/**
 * Generate a round of conversation exchanges for the dinner party.
 */
export async function generateConversationRound(
  session: DinnerSession,
  action: 'start' | 'continue' | 'user-spoke',
  userInput?: string
): Promise<ConversationExchange[]> {
  try {
    const systemPrompt = buildConversationSystemPrompt(session);
    const messages = buildConversationHistory(session, action, userInput);

    const raw = await callClaude(systemPrompt, messages);

    const parsed = parseJsonResponse<
      Array<{
        type?: string;
        speaker?: string;
        text?: string;
      }>
    >(raw);

    if (!Array.isArray(parsed)) {
      throw new Error('Expected a JSON array of exchanges from Claude');
    }

    const exchanges: ConversationExchange[] = parsed.map((item) => ({
      id: generateExchangeId(),
      type: (item.type as ConversationExchange['type']) ?? 'speech',
      speaker: item.speaker,
      text: item.text ?? '',
    }));

    return exchanges;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('generateConversationRound failed:', errMsg, error);

    // Return a graceful fallback so the UI can still show something
    const guestNames = session.guests.map((g) => g.figureId);
    const fallbackSpeaker = guestNames[0] ?? 'Unknown Guest';

    return [
      {
        id: generateExchangeId(),
        type: 'narration',
        text: `A momentary silence falls over the table. [Debug: ${errMsg}]`,
      },
      {
        id: generateExchangeId(),
        type: 'speech',
        speaker: fallbackSpeaker,
        text: 'Forgive me — I seem to have lost my train of thought. Shall we revisit the topic?',
      },
    ];
  }
}
