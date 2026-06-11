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
    'Stage a finished README draft so the user can review it and save it to ' +
    'disk with one click. It does NOT write any file itself. ' +
    'You MUST call this for EVERY request to generate, create, write, update, ' +
    'translate, or improve the README — for brand-new READMEs as well as edits. ' +
    'Writing the README as text in your chat reply does not stage it and does ' +
    'not satisfy the request; only this tool does. Do not skip it. ' +
    'Before proposing a new one, call findExistingReadme — if one exists, ' +
    'improve it rather than discard it. ' +
    'Pass the complete README markdown as `content`: clear, well-structured ' +
    'markdown with a title, description, prerequisites, install, run/usage, ' +
    'and any project-specific sections. Keep it accurate to the actual code — ' +
    'never invent commands or features not found in the files. ' +
    'The draft opens in a preview panel beside the chat, so do NOT also paste ' +
    'the full README into your reply — write only a brief one-line note (and, ' +
    'when editing an existing README, a short summary of what changed).',
  inputSchema: z.object({
    content: z
      .string()
      .describe('The complete README markdown to stage for saving.'),
  }),
});

export type ProposeReadmeInput = { content: string };
