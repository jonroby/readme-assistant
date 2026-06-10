import type { Project } from '@/lib/project';
import type { SearchFilesInput } from './search-files';

/** Caps so a broad query in a big project can't flood the agent's context. */
const MAX_FILES = 30;
const MAX_LINES_PER_FILE = 5;

/**
 * Client-side runner for searchFiles. Case-insensitive substring search over
 * file contents; returns matching files with their matching lines (line
 * numbers included). Never throws — returns a message string on the empty
 * cases so the agent loop keeps going.
 */
export function runSearchFiles(
  input: SearchFilesInput,
  project: Project | null,
): string {
  if (!project) return 'No project loaded.';

  const query = input.query?.trim();
  if (!query) return 'Empty search query.';

  const needle = query.toLowerCase();
  const prefix = input.prefix?.trim();

  const blocks: string[] = [];
  let truncatedFiles = 0;

  for (const file of project.files) {
    if (prefix && !file.path.startsWith(prefix)) continue;

    const hits: string[] = [];
    const lines = file.content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(needle)) {
        hits.push(`  ${i + 1}: ${lines[i].trim()}`);
      }
    }
    if (!hits.length) continue;

    if (blocks.length >= MAX_FILES) {
      truncatedFiles++;
      continue;
    }

    const shown = hits.slice(0, MAX_LINES_PER_FILE);
    const more =
      hits.length > shown.length
        ? `\n  …${hits.length - shown.length} more match(es)`
        : '';
    blocks.push(`${file.path}\n${shown.join('\n')}${more}`);
  }

  if (!blocks.length) return `No matches for "${query}".`;

  const footer = truncatedFiles
    ? `\n\n…and matches in ${truncatedFiles} more file(s) (narrow with a prefix).`
    : '';
  return blocks.join('\n\n') + footer;
}
