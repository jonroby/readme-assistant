'use client';

import { useState } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Project } from '@/lib/project';
import { ClearProjectDialog } from './clear-project-dialog';
import { projectName } from './tree';
import { TreeList } from './tree-list';

type FileTreeProps = {
  project: Project;
  activePath: string | null;
  onSelectFile: (path: string) => void;
  onClear: () => void;
};

/**
 * Left sidebar for the active project: a scrollable file tree with a
 * "Clear project" action pinned at the bottom. Collapses to a thin icon rail
 * to give the chat/viewer more room, and expands back to the full tree.
 */
export function FileTree({
  project,
  activePath,
  onSelectFile,
  onClear,
}: FileTreeProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <aside className="flex w-10 shrink-0 flex-col items-center border-r py-2">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Expand file tree"
          onClick={() => setCollapsed(false)}
        >
          <PanelLeftOpen className="size-4" />
        </Button>
      </aside>
    );
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r">
      <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b px-2 pl-4">
        <span className="truncate text-sm font-medium">
          {projectName(project)}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Collapse file tree"
          onClick={() => setCollapsed(true)}
        >
          <PanelLeftClose className="size-4" />
        </Button>
      </div>
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
