'use client';

import { X } from 'lucide-react';
import type { Project } from '@/lib/project';

type FileViewerProps = {
  project: Project;
  path: string;
  onClose: () => void;
};

/**
 * Read-only viewer for a single open file. Shows the raw contents in a
 * scrollable monospace block; the chat sits beside it (see the page split).
 */
export function FileViewer({ project, path, onClose }: FileViewerProps) {
  const file = project.files.find((f) => f.path === path);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 basis-0 flex-col border-r">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-2">
        <span className="truncate font-mono text-sm">{path}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close file"
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
      <pre className="min-h-0 flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed">
        {file ? file.content : `File not found: ${path}`}
      </pre>
    </div>
  );
}
