'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, File, Folder } from 'lucide-react';
import type { TreeNode } from './tree';

type TreeRowProps = {
  node: TreeNode;
  depth: number;
};

/**
 * A single tree node. Folders expand/collapse and recurse into their children;
 * files are inert for now (no contents are shown).
 */
export function TreeRow({ node, depth }: TreeRowProps) {
  const isFolder = !!node.children;
  const [open, setOpen] = useState(depth === 0);
  // Indent by depth; the chevron column keeps files aligned under folders.
  const pad = { paddingLeft: `${depth * 12 + 8}px` };

  if (!isFolder) {
    return (
      <li
        style={pad}
        className="flex items-center gap-1.5 py-0.5 text-muted-foreground"
      >
        <File className="size-3.5 shrink-0" />
        <span className="truncate">{node.name}</span>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={pad}
        className="flex w-full items-center gap-1 py-0.5 hover:text-foreground"
      >
        {open ? (
          <ChevronDown className="size-3.5 shrink-0" />
        ) : (
          <ChevronRight className="size-3.5 shrink-0" />
        )}
        <Folder className="size-3.5 shrink-0" />
        <span className="truncate">{node.name}</span>
      </button>
      {open && (
        <ul>
          {node.children!.map((child) => (
            <TreeRow key={child.path} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}
