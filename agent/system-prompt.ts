/**
 * Builds the system prompt for the README assistant. The project's files are
 * NOT dumped here — the model discovers them by calling listFiles, so this
 * scales to large folders. The chat UI only mounts once a project is loaded, so
 * a project is always present; no need to branch on it.
 */
export function buildSystemPrompt(): string {
  return `You are a README assistant. A project has been loaded. Help the user
understand it and generate or improve its README, grounding everything you say
in the project's actual files (which you inspect with your tools).`;
}
