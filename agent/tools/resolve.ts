import type { Project } from '@/lib/project';
import { runFindExistingReadme } from './find-existing-readme';
import { runListFiles, type ListFilesInput } from './list-files';
import { runReadFile, type ReadFileInput } from './read-file';
import { runSearchFiles, type SearchFilesInput } from './search-files';
import { runProposeReadme, type ProposeReadmeInput } from './propose-readme';

/** Inputs keyed by tool name — the shape each runner expects. */
export type ToolInputs = {
  findExistingReadme: Record<string, never>;
  listFiles: ListFilesInput;
  readFile: ReadFileInput;
  searchFiles: SearchFilesInput;
  proposeReadme: ProposeReadmeInput;
};

export type ToolName = keyof ToolInputs;

/**
 * The single name → runner mapping for the agent's tools. Both the browser
 * (use-chat-session's onToolCall) and the headless eval harness dispatch
 * through here, so there is exactly one place that says which runner backs each
 * tool — no per-call-site duplication to drift out of sync.
 *
 * Returns the string the model sees as the tool result. proposeReadme's runner
 * ignores the content (it only stages); callers that need the staged markdown
 * read it from the input themselves.
 */
export function resolveToolCall<N extends ToolName>(
  name: N,
  input: ToolInputs[N],
  project: Project | null,
): string {
  switch (name) {
    case 'findExistingReadme':
      return runFindExistingReadme(project);
    case 'listFiles':
      return runListFiles(input as ListFilesInput, project);
    case 'readFile':
      return runReadFile(input as ReadFileInput, project);
    case 'searchFiles':
      return runSearchFiles(input as SearchFilesInput, project);
    case 'proposeReadme':
      return runProposeReadme();
    default: {
      // Exhaustiveness guard: a new tool name without a case fails to compile.
      const exhaustive: never = name;
      throw new Error(`Unhandled tool: ${String(exhaustive)}`);
    }
  }
}
