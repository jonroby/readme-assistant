import type { Project, ProjectFile } from '@/lib/project';

/**
 * The project's display name — the picked folder's name, set when the project
 * was read. Falls back to "Project" if missing (e.g. older persisted data).
 */
export function projectName(project: Project): string {
  return project.name || 'Project';
}

export type TreeNode = {
  name: string;
  path: string; // full path from the project root
  // Folders have children; files have undefined (leaf).
  children?: TreeNode[];
};

/**
 * Build a nested folder/file tree from a project's flat path list. Folders are
 * inferred from path segments; entries are sorted folders-first, then
 * alphabetically, so the tree reads like a file explorer.
 */
export function buildFileTree(files: ProjectFile[]): TreeNode[] {
  const root: TreeNode = { name: '', path: '', children: [] };

  for (const file of files) {
    const segments = file.path.split('/').filter(Boolean);
    let node = root;

    segments.forEach((name, i) => {
      const isLeaf = i === segments.length - 1;
      const path = segments.slice(0, i + 1).join('/');
      let child = node.children?.find((c) => c.name === name);

      if (!child) {
        child = isLeaf ? { name, path } : { name, path, children: [] };
        node.children!.push(child);
      }
      node = child;
    });
  }

  return sortNodes(root.children ?? []);
}

/** Folders before files, then alphabetical — recursively. */
function sortNodes(nodes: TreeNode[]): TreeNode[] {
  for (const node of nodes) {
    if (node.children) node.children = sortNodes(node.children);
  }
  return nodes.sort((a, b) => {
    const aFolder = a.children ? 0 : 1;
    const bFolder = b.children ? 0 : 1;
    return aFolder - bFolder || a.name.localeCompare(b.name);
  });
}
