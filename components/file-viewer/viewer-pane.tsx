'use client';

import type { ReactNode } from 'react';
import { X } from 'lucide-react';

type ViewerPaneProps = {
  /** Header title (a file path or draft label). */
  title: string;
  /** Header controls shown before the close button (e.g. Save/Diff). */
  actions?: ReactNode;
  onClose: () => void;
  /** The pane body — a file body, draft body, or diff. */
  children: ReactNode;
};

/**
 * The viewer frame: a bordered column with a header (title + actions + close)
 * over a body. Dumb and mode-agnostic — FileViewer and DraftViewer fill in the
 * title, actions, and body.
 */
export function ViewerPane({
  title,
  actions,
  onClose,
  children,
}: ViewerPaneProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 basis-0 flex-col border-r">
      <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b px-4">
        <span className="truncate font-mono text-sm">{title}</span>
        <div className="flex shrink-0 items-center gap-3">
          {actions}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
