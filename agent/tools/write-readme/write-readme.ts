import { tool } from 'ai';
import { z } from 'zod';

/**
 * Server-side definition for the writeReadme tool. No `execute`: the browser
 * resolves it, because only the browser can prompt the user to save a file to
 * their disk (see ./run).
 */
export const writeReadmeTool = tool({
  description:
    'Save a README to the user’s disk, prompting them to choose where. Use ' +
    'this whenever the user wants a README generated, created, or written out ' +
    '— showing the draft in chat does not satisfy that request, so call this ' +
    'as well (if they only want to review or discuss a draft, just show it). ' +
    'Pass the complete README markdown as `content`: clear, well-structured ' +
    'markdown with a title, description, prerequisites, install, run/usage, ' +
    'and any project-specific sections. Keep it accurate to the actual code — ' +
    'never invent commands or features not found in the files. After saving ' +
    'an edit to an existing README, briefly explain what you changed.',
  inputSchema: z.object({
    content: z
      .string()
      .describe('The complete README markdown to write to disk.'),
  }),
});

export type WriteReadmeInput = { content: string };
