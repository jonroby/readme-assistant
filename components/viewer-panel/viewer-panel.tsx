'use client';

import { findReadme, type Project } from '@/lib/project';
import type { SaveResult } from '@/app/home/hooks/use-readme-saver';
import { FileViewer } from './file-viewer';
import { DraftViewer } from './draft-viewer';

type ViewerPanelProps = {
  project: Project;
  /** Path of the real project file to show, or null. */
  openFile: string | null;
  /** Staged README draft to show, or null. Takes precedence over openFile. */
  draft: string | null;
  onClose: () => void;
  /** Save a draft (draft mode only). */
  onSave: (content: string) => void;
  saveStatus: SaveResult | null;
};

/**
 * The center workspace panel: shows EITHER a staged README draft or a real
 * project file — never both (a draft takes precedence). Renders nothing when
 * neither is open. Owns the draft-vs-file decision and the diff base, so the
 * app shell just hands it the view state.
 */
export function ViewerPanel({
  project,
  openFile,
  draft,
  onClose,
  onSave,
  saveStatus,
}: ViewerPanelProps) {
  if (draft !== null) {
    return (
      <DraftViewer
        draft={draft}
        // Existing README to diff the draft against (null if none → no diff).
        base={findReadme(project)?.content ?? null}
        onClose={onClose}
        onSave={onSave}
        saveStatus={saveStatus}
      />
    );
  }
  if (openFile !== null) {
    return <FileViewer project={project} path={openFile} onClose={onClose} />;
  }
  return null;
}
