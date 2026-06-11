import { openai } from '@ai-sdk/openai';
import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from 'ai';
import { tools } from '@/agent/tools';
import { buildSystemPrompt } from '@/agent/system-prompt';

// Allow streaming responses up to 30 seconds.
export const maxDuration = 30;

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: buildSystemPrompt(),
    messages: await convertToModelMessages(messages),
    // No tool has `execute` — they all resolve on the client.
    tools,
    // Cap the agentic loop so a README run can read a few files then write.
    stopWhen: stepCountIs(6),
  });

  return result.toUIMessageStreamResponse();
}
