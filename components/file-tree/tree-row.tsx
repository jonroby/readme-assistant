'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, File, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TreeNode } from './tree';

type TreeRowProps = {
  node: TreeNode;
  depth: number;
  activePath: string | null;
  onSelectFile: (path: string) => void;
};

/**
 * A single tree node. Folders expand/collapse and recurse into their children;
 * files are selectable and open in the file viewer.
 */
export function TreeRow({ node, depth, activePath, onSelectFile }: TreeRowProps) {
  const isFolder = !!node.children;
  const [open, setOpen] = useState(depth === 0);
  // Indent by depth; the chevron column keeps files aligned under folders.
  const pad = { paddingLeft: `${depth * 12 + 8}px` };

  if (!isFolder) {
    return (
      <li>
        <button
          type="button"
          onClick={() => onSelectFile(node.path)}
          style={pad}
          className={cn(
            'flex w-full items-center gap-1.5 py-0.5 text-muted-foreground hover:text-foreground',
            activePath === node.path && 'text-foreground font-medium',
          )}
        >
          <File className="size-3.5 shrink-0" />
          <span className="truncate">{node.name}</span>
        </button>
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
            <TreeRow
              key={child.path}
              node={child}
              depth={depth + 1}
              activePath={activePath}
              onSelectFile={onSelectFile}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
