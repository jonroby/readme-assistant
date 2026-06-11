import { diffLines } from 'diff';

export type DiffLine = { kind: 'add' | 'remove' | 'context'; text: string };

/**
 * Flatten diffLines' per-change blocks into individual lines, each tagged with
 * how it changed, so each can render on its own row. A change block's value is
 * one or more lines joined by "\n"; a trailing newline yields an empty final
 * entry, which we drop so blocks don't render a blank trailing row.
 */
export function toDiffLines(base: string, next: string): DiffLine[] {
  const lines: DiffLine[] = [];
  for (const part of diffLines(base, next)) {
    const kind: DiffLine['kind'] = part.added
      ? 'add'
      : part.removed
        ? 'remove'
        : 'context';
    const partLines = part.value.split('\n');
    if (partLines[partLines.length - 1] === '') partLines.pop();
    for (const text of partLines) lines.push({ kind, text });
  }
  return lines;
}
