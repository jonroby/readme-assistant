import { openai } from '@ai-sdk/openai';
import { convertToModelMessages, streamText, type UIMessage } from 'ai';

// Allow streaming responses up to 30 seconds.
export const maxDuration = 30;

export async function POST(request: Request) {
  const {
    messages,
    fileName,
    fileContent,
  }: { messages: UIMessage[]; fileName?: string; fileContent?: string } =
    await request.json();

  const system = fileContent
    ? `The user has uploaded a file named "${fileName}". Use its contents to answer their questions.\n\n--- FILE CONTENTS ---\n${fileContent}\n--- END FILE CONTENTS ---`
    : undefined;

  const result = streamText({
    model: openai('gpt-4o'),
    system,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
