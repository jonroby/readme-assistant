import { tool } from 'ai';
import { z } from 'zod';

/**
 * Server-side definition for the readFile tool. There is no `execute`: the
 * AI SDK surfaces the call to the browser, which holds the uploaded project
 * and resolves it (see ./run).
 */
export const readFileTool = tool({
  description: 'Read the full contents of a file in the project.',
  inputSchema: z.object({
    path: z.string().describe('The file path, exactly as listed.'),
  }),
});

export type ReadFileInput = { path: string };
