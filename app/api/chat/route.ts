import { openai } from '@ai-sdk/openai';
import { convertToModelMessages, streamText, type UIMessage } from 'ai';

// Allow streaming responses up to 30 seconds.
export const maxDuration = 30;

export async function POST(request: Request) {
  const {
    messages,
    projectText,
  }: { messages: UIMessage[]; projectText?: string } = await request.json();

  const system = projectText
    ? `The user has uploaded a project. Each file is delimited by "=== <path> ===" headers. Use its contents to answer their questions.\n\n--- PROJECT FILES ---\n${projectText}\n--- END PROJECT FILES ---`
    : undefined;

  const result = streamText({
    model: openai('gpt-4o'),
    system,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
