'use client';

import type { Project } from '@/lib/project';
import { CodeBody } from './code-body';
import { ViewerPane } from './viewer-pane';

type FileViewerProps = {
  project: Project;
  path: string;
  onClose: () => void;
};

/**
 * Read-only viewer for a single project file, syntax-highlighted with Shiki.
 * Looks its content up by path; the draft equivalent is DraftViewer.
 */
export function FileViewer({ project, path, onClose }: FileViewerProps) {
  const content = project.files.find((f) => f.path === path)?.content ?? null;

  return (
    <ViewerPane title={path} onClose={onClose}>
      <CodeBody content={content} path={path} />
    </ViewerPane>
  );
}
