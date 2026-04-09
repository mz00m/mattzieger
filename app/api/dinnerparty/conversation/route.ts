import { NextRequest, NextResponse } from 'next/server';
import { generateConversationRound } from '@/lib/conversationOrchestrator';
import type { DinnerSession } from '@/lib/conversationOrchestrator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session, action = 'continue', userInput } = body as {
      session: DinnerSession;
      action: 'start' | 'continue' | 'user-spoke';
      userInput?: string;
    };

    if (!session) {
      return NextResponse.json(
        { error: 'Session data is required' },
        { status: 400 }
      );
    }

    if (!session.guests || session.guests.length === 0) {
      return NextResponse.json(
        { error: 'Session must have at least one guest' },
        { status: 400 }
      );
    }

    const exchanges = await generateConversationRound(
      session,
      action,
      userInput
    );

    return NextResponse.json({ exchanges });
  } catch (error) {
    console.error('Conversation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate conversation' },
      { status: 500 }
    );
  }
}
