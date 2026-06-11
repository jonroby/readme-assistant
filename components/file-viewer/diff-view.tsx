'use client';

import { diffLines } from 'diff';

type DiffViewProps = {
  /** The current on-disk content (what we diff against). */
  base: string;
  /** The proposed content (the draft). */
  next: string;
};

type DiffLine = { kind: 'add' | 'remove' | 'context'; text: string };

// Flatten diffLines' per-change blocks into individual lines, each tagged with
// how it changed, so each can render on its own row with its own background.
function toDiffLines(base: string, next: string): DiffLine[] {
  const lines: DiffLine[] = [];
  for (const part of diffLines(base, next)) {
    const kind: DiffLine['kind'] = part.added
      ? 'add'
      : part.removed
        ? 'remove'
        : 'context';
    // A change block's value is one or more lines joined by "\n"; a trailing
    // newline yields an empty final entry we drop.
    const partLines = part.value.split('\n');
    if (partLines[partLines.length - 1] === '') partLines.pop();
    for (const text of partLines) lines.push({ kind, text });
  }
  return lines;
}

const ROW_STYLE: Record<DiffLine['kind'], string> = {
  add: 'bg-green-500/15 text-green-900 dark:text-green-200',
  remove: 'bg-red-500/15 text-red-900 dark:text-red-200',
  context: 'text-muted-foreground',
};

const GUTTER: Record<DiffLine['kind'], string> = {
  add: '+',
  remove: '-',
  context: ' ',
};

/**
 * A unified line-by-line diff of `base` → `next`. Added lines are green,
 * removed red, unchanged muted — each with a +/-/space gutter, so the user can
 * see what a save would change before committing it.
 */
export function DiffView({ base, next }: DiffViewProps) {
  const lines = toDiffLines(base, next);

  return (
    <div className="min-h-0 flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed">
      {lines.map((line, i) => (
        <div key={i} className={`flex whitespace-pre-wrap ${ROW_STYLE[line.kind]}`}>
          <span className="mr-2 shrink-0 select-none opacity-60">
            {GUTTER[line.kind]}
          </span>
          <span className="min-w-0 break-words">{line.text || ' '}</span>
        </div>
      ))}
    </div>
  );
}
