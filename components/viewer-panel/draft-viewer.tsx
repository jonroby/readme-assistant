'use client';

import { useState } from 'react';
import type { SaveResult } from '@/app/home/hooks/use-readme-saver';
import { Button } from '@/components/ui/button';
import { CodeBody } from './code-body';
import { DiffView } from './diff-view';
import { ViewerPane } from './viewer-pane';

type DraftViewerProps = {
  /** The proposed README markdown, staged but not yet on disk. */
  draft: string;
  /** The existing README to diff against, or null if there is none. */
  base: string | null;
  onClose: () => void;
  onSave: (content: string) => void;
  saveStatus: SaveResult | null;
};

// The synthetic path a staged draft renders under (also drives Shiki's lang).
const DRAFT_PATH = 'README.md (draft)';

/**
 * Viewer for a staged README draft: the proposed markdown plus the controls to
 * write it back (Save) and to preview what saving would change (Diff, only when
 * there is an existing README to compare against).
 */
export function DraftViewer({
  draft,
  base,
  onClose,
  onSave,
  saveStatus,
}: DraftViewerProps) {
  const [showDiff, setShowDiff] = useState(false);

  const saved = saveStatus?.ok === true;
  // A diff needs an existing README to compare to; a brand-new one has none.
  const canDiff = base != null;
  const diffing = canDiff && showDiff;

  const actions = (
    <>
      {saveStatus && !saveStatus.ok && (
        <span className="text-xs text-destructive">{saveStatus.message}</span>
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
      <Button size="sm" onClick={() => onSave(draft)} disabled={saved}>
        {saved ? 'Saved ✓' : 'Save to disk'}
      </Button>
    </>
  );

  return (
    <ViewerPane title={DRAFT_PATH} actions={actions} onClose={onClose}>
      {diffing ? (
        <DiffView base={base} next={draft} />
      ) : (
        <CodeBody content={draft} path="README.md" />
      )}
    </ViewerPane>
  );
}
