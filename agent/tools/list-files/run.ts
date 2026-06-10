import type { Project } from '@/lib/project';
import type { ListFilesInput } from './list-files';

/** Cap on how many paths we return, so a huge folder can't flood the context. */
const MAX_PATHS = 300;

/**
 * Client-side runner for listFiles. Returns the project's paths (optionally
 * filtered to a directory prefix), one per line. Never throws — returns a
 * message string on the empty/no-project cases so the agent loop keeps going.
 */
export function runListFiles(
  input: ListFilesInput,
  project: Project | null,
): string {
  if (!project) return 'No project loaded.';

  const prefix = input.prefix?.trim();
  const paths = project.files
    .map((f) => f.path)
    .filter((p) => !prefix || p.startsWith(prefix));

  if (!paths.length) {
    return prefix ? `No files under "${prefix}".` : 'No files in project.';
  }

  const shown = paths.slice(0, MAX_PATHS);
  const header = shown.map((p) => `- ${p}`).join('\n');
  if (paths.length > shown.length) {
    return `${header}\n…and ${paths.length - shown.length} more (narrow with a prefix).`;
  }
  return header;
}
