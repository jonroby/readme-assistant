'use client';

import type { Project } from '@/lib/project';
import { buildFileTree } from './tree';
import { TreeRow } from './tree-row';

type FileTreeProps = {
  project: Project;
  activePath: string | null;
  onSelectFile: (path: string) => void;
};

/**
 * Read-only file tree for the active project, shown in the left sidebar.
 * Folders expand/collapse; clicking a file opens it in the viewer.
 */
export function FileTree({ project, activePath, onSelectFile }: FileTreeProps) {
  const nodes = buildFileTree(project.files);
  return (
    <ul className="text-sm">
      {nodes.map((node) => (
        <TreeRow
          key={node.path}
          node={node}
          depth={0}
          activePath={activePath}
          onSelectFile={onSelectFile}
        />
      ))}
    </ul>
  );
}
