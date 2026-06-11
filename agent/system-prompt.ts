/**
 * Builds the system prompt for the README assistant. The project's files are
 * NOT dumped here — the model discovers them by calling listFiles, so this
 * scales to large folders. We only signal whether a project is loaded.
 */
export function buildSystemPrompt(hasProject: boolean): string | undefined {
  if (!hasProject) return undefined;

  return `You are a README assistant. A project has been loaded. Help the user
understand it and generate or improve its README, grounding everything you say
in the project's actual files (which you inspect with your tools).`;
}
