'use client';

import type { Project } from '@/lib/project';
import { buildFileTree } from './tree';
import { TreeRow } from './tree-row';

type TreeListProps = {
  project: Project;
  activePath: string | null;
  onSelectFile: (path: string) => void;
};

/**
 * The file/folder rows themselves. Folders expand/collapse; clicking a file
 * opens it in the viewer. Wrapped by FileTree, which adds the sidebar chrome.
 */
export function TreeList({ project, activePath, onSelectFile }: TreeListProps) {
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
