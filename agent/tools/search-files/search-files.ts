import { tool } from 'ai';
import { z } from 'zod';

/**
 * Server-side definition for the searchFiles tool. No `execute`: surfaced to
 * the browser, which resolves it against the in-browser project (see ./run).
 * Lets the model find where something appears without reading whole files.
 */
export const searchFilesTool = tool({
  description:
    'Search file contents for a query string (case-insensitive) and return ' +
    'matching files with the matching lines. Use this to locate relevant ' +
    'code in a large project before reading a whole file.',
  inputSchema: z.object({
    query: z.string().describe('The text to search for.'),
    prefix: z
      .string()
      .optional()
      .describe('Only search files under this directory prefix (e.g. "src/").'),
  }),
});

export type SearchFilesInput = { query: string; prefix?: string };
