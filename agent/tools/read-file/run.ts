import type { Project } from '@/lib/project';
import type { ReadFileInput } from './read-file';

/**
 * Client-side runner for readFile. Reads the file out of the in-browser
 * project. Returns a string (the tool output) — never throws, so the agent
 * loop can keep going even on a bad path.
 */
export function runReadFile(
  input: ReadFileInput,
  project: Project | null,
): string {
  const file = project?.files.find((f) => f.path === input.path);
  return file ? file.content : `File not found: ${input.path}`;
}
