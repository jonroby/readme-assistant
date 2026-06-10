import { openai } from '@ai-sdk/openai';
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from 'ai';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds.
export const maxDuration = 30;

export async function POST(request: Request) {
  const {
    messages,
    paths,
  }: { messages: UIMessage[]; paths?: string[] } = await request.json();

  const system = paths?.length
    ? `The user has uploaded a project with these files:\n${paths
        .map((p) => `- ${p}`)
        .join(
          '\n',
        )}\n\nUse the readFile tool to read any files you need before answering. Only read files relevant to the question.`
    : undefined;

  const result = streamText({
    model: openai('gpt-4o'),
    system,
    messages: await convertToModelMessages(messages),
    // No `execute` — readFile is resolved on the client (it has the files).
    tools: {
      readFile: tool({
        description: 'Read the full contents of a file in the project.',
        inputSchema: z.object({
          path: z.string().describe('The file path, exactly as listed.'),
        }),
      }),
    },
    // Cap the agentic loop: up to 2 tool calls, then a final answer.
    stopWhen: stepCountIs(3),
  });

  return result.toUIMessageStreamResponse();
}
