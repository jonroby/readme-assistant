import { tool } from 'ai';
import { z } from 'zod';

/**
 * Server-side definition for the proposeReadme tool. No `execute`: the tool
 * does not write anything. It STAGES a finished README draft on the message so
 * the UI can offer a save step — the actual disk write needs a user gesture
 * (a button click), which a streaming tool callback can't provide (see ./run).
 */
export const proposeReadmeTool = tool({
  description:
    'Propose a finished README draft for the project. This STAGES the draft so ' +
    'the user can review it and save it to disk with one click — it does NOT ' +
    'write any file itself. Call this whenever the user wants a README ' +
    'generated, created, written, or improved; showing the markdown in chat ' +
    'alone does not stage it, so call this as well (if they only want to ' +
    'discuss or review a draft, just show it in chat instead). ' +
    'Before proposing from scratch, call findExistingReadme — if one exists, ' +
    'improve it rather than discard it. ' +
    'Pass the complete README markdown as `content`: clear, well-structured ' +
    'markdown with a title, description, prerequisites, install, run/usage, ' +
    'and any project-specific sections. Keep it accurate to the actual code — ' +
    'never invent commands or features not found in the files. After proposing ' +
    'an edit to an existing README, briefly explain what you changed.',
  inputSchema: z.object({
    content: z
      .string()
      .describe('The complete README markdown to stage for saving.'),
  }),
});

export type ProposeReadmeInput = { content: string };
