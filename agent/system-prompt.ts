/**
 * Builds the system prompt for the README assistant. The project's files are
 * NOT dumped here — the model discovers them by calling listFiles, so this
 * scales to large folders. We only signal whether a project is loaded.
 */
export function buildSystemPrompt(hasProject: boolean): string | undefined {
  if (!hasProject) return undefined;

  return `You are a README assistant. A project has been uploaded. Use your
tools to explore it — call listFiles to see what files exist, then readFile to
read the ones you need — and help the user generate or improve its README.`;
}
