'use client';

import type { Project } from '@/lib/project';
import { ClearProjectDialog } from './clear-project-dialog';
import { TreeList } from './tree-list';

type FileTreeProps = {
  project: Project;
  activePath: string | null;
  onSelectFile: (path: string) => void;
  onClear: () => void;
};

/**
 * Left sidebar for the active project: a scrollable file tree with a
 * "Clear project" action pinned at the bottom.
 */
export function FileTree({
  project,
  activePath,
  onSelectFile,
  onClear,
}: FileTreeProps) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r">
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <TreeList
          project={project}
          activePath={activePath}
          onSelectFile={onSelectFile}
        />
      </div>
      <div className="border-t p-3">
        <ClearProjectDialog onConfirm={onClear} />
      </div>
    </aside>
  );
}
