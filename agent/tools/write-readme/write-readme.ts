import { tool } from 'ai';
import { z } from 'zod';

/**
 * Server-side definition for the writeReadme tool. No `execute`: the browser
 * resolves it, because only the browser can prompt the user to save a file to
 * their disk (see ./run).
 */
export const writeReadmeTool = tool({
  description:
    'Save a README to the user’s disk, prompting them to choose where. Use this whenever the user wants a README generated, created, or written out. Pass the complete README markdown as `content`.',
  inputSchema: z.object({
    content: z
      .string()
      .describe('The complete README markdown to write to disk.'),
  }),
});

export type WriteReadmeInput = { content: string };
