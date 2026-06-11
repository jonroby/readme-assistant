'use client';

import { toDiffLines, type DiffLine } from './diff-lines';

type DiffViewProps = {
  /** The current on-disk content (what we diff against). */
  base: string;
  /** The proposed content (the draft). */
  next: string;
};

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
  return (
    <div className="min-h-0 flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed">
      {toDiffLines(base, next).map((line, i) => (
        <div
          key={i}
          className={`flex whitespace-pre-wrap ${ROW_STYLE[line.kind]}`}
        >
          <span className="mr-2 shrink-0 select-none opacity-60">
            {GUTTER[line.kind]}
          </span>
          <span className="min-w-0 break-words">{line.text || ' '}</span>
        </div>
      ))}
    </div>
  );
}
