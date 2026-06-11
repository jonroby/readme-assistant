'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { Project } from '@/lib/project';
import type { SaveResult } from '@/app/home/hooks/use-readme-saver';
import { Button } from '@/components/ui/button';
import { DiffView } from './diff-view';
import { useHighlightedCode } from './use-highlighted-code';

// The viewer shows EITHER a real project file (by path) or a staged README
// draft (content held in app state, not on disk yet). Only the draft carries
// save controls — that is the one thing the user can write back to disk. A
// draft may also carry `base`: the existing README's content, so the user can
// toggle a diff of what saving would change.
type FileViewerProps = {
  project: Project;
  onClose: () => void;
} & (
  | { path: string; draft?: never; base?: never; onSave?: never; saveStatus?: never }
  | {
      draft: string;
      base: string | null;
      path?: never;
      onSave: (content: string) => void;
      saveStatus: SaveResult | null;
    }
);

// A staged draft renders under this label and is highlighted as markdown.
const DRAFT_PATH = 'README.md (draft)';

/**
 * Read-only viewer for a single open file, syntax-highlighted with Shiki. The
 * chat sits beside it (see the page split). Highlighting is async, so the raw
 * text shows until it resolves. Can also show a staged README draft, which has
 * no on-disk file — its content comes straight from app state.
 */
export function FileViewer({
  project,
  path,
  draft,
  base,
  onClose,
  onSave,
  saveStatus,
}: FileViewerProps) {
  const [showDiff, setShowDiff] = useState(false);

  // A draft renders its own content under a synthetic markdown path; a real
  // file is looked up from the project by path.
  const isDraft = draft !== undefined;
  const displayPath = isDraft ? DRAFT_PATH : path!;
  const content = isDraft
    ? draft
    : (project.files.find((f) => f.path === path)?.content ?? null);
  const html = useHighlightedCode(content, isDraft ? 'README.md' : path!);
  const saved = saveStatus?.ok === true;
  // A diff is only meaningful against an existing README; a brand-new one has
  // nothing to compare to, so the toggle is hidden.
  const canDiff = isDraft && base != null;
  const diffing = canDiff && showDiff;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 basis-0 flex-col border-r">
      <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b px-4">
        <span className="truncate font-mono text-sm">{displayPath}</span>
        <div className="flex shrink-0 items-center gap-3">
          {/* The draft is the only viewable content the user can write back. */}
          {isDraft && (
            <>
              {saveStatus && !saveStatus.ok && (
                <span className="text-xs text-destructive">
                  {saveStatus.message}
                </span>
              )}
              {canDiff && (
                <Button
                  size="sm"
                  variant={diffing ? 'secondary' : 'outline'}
                  onClick={() => setShowDiff((v) => !v)}
                >
                  {diffing ? 'Hide diff' : 'Diff'}
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => onSave!(draft)}
                disabled={saved}
              >
                {saved ? 'Saved ✓' : 'Save to disk'}
              </Button>
            </>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close file"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
      {diffing ? (
        <DiffView base={base!} next={draft!} />
      ) : content === null ? (
        <pre className="min-h-0 flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed">
          {`File not found: ${displayPath}`}
        </pre>
      ) : html ? (
        // Shiki output is generated from the file content (escaped), so the
        // markup is trusted. [&>pre] styling makes its <pre> fill and scroll.
        <div
          className="min-h-0 flex-1 overflow-auto p-4 text-xs leading-relaxed [&>pre]:bg-transparent! [&>pre]:font-mono"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="min-h-0 flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed">
          {content}
        </pre>
      )}
    </div>
  );
}
