'use client';

import type { Project } from '@/lib/project';
import { buildFileTree } from './tree';
import { TreeRow } from './tree-row';

type FileTreeProps = {
  project: Project;
};

/**
 * Read-only file tree for the active project, shown in the left sidebar.
 * Folders expand/collapse; files are inert for now (no contents are shown).
 */
export function FileTree({ project }: FileTreeProps) {
  const nodes = buildFileTree(project.files);
  return (
    <ul className="text-sm">
      {nodes.map((node) => (
        <TreeRow key={node.path} node={node} depth={0} />
      ))}
    </ul>
  );
}
