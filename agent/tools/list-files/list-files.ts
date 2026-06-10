import { tool } from 'ai';
import { z } from 'zod';

/**
 * Server-side definition for the listFiles tool. No `execute`: the call is
 * surfaced to the browser, which holds the project and resolves it (see ./run).
 * Lets the model discover paths in a big project without every path being
 * dumped into the system prompt.
 */
export const listFilesTool = tool({
  description:
    'List file paths in the project. Optionally filter to a directory ' +
    'prefix. Use this to discover files before reading them — especially in ' +
    'large projects.',
  inputSchema: z.object({
    prefix: z
      .string()
      .optional()
      .describe(
        'Only list files whose path starts with this directory prefix ' +
          '(e.g. "src/"). Omit to list everything.',
      ),
  }),
});

export type ListFilesInput = { prefix?: string };
