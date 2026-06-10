import { tool } from 'ai';
import { z } from 'zod';

/**
 * Server-side definition for the findExistingReadme tool. No `execute`: the
 * browser resolves it against the in-browser project (see ./run). Lets the
 * model check whether a README already exists — and read it — so it can
 * improve the existing one instead of blindly replacing it.
 */
export const findExistingReadmeTool = tool({
  description:
    'Check whether the project already has a README at its root, and if so ' +
    'return its current contents. Call this before writeReadme so you can ' +
    'improve an existing README rather than discard it. The user is warned ' +
    'before any overwrite, so saving is safe — but improving beats replacing.',
  inputSchema: z.object({}),
});
