'use client';

import { X } from 'lucide-react';
import type { Project } from '@/lib/project';
import { useHighlightedCode } from './use-highlighted-code';

type FileViewerProps = {
  project: Project;
  path: string;
  onClose: () => void;
};

/**
 * Read-only viewer for a single open file, syntax-highlighted with Shiki. The
 * chat sits beside it (see the page split). Highlighting is async, so the raw
 * text shows until it resolves.
 */
export function FileViewer({ project, path, onClose }: FileViewerProps) {
  const file = project.files.find((f) => f.path === path);
  const content = file?.content ?? null;
  const html = useHighlightedCode(content, path);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 basis-0 flex-col border-r">
      <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b px-4">
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
      {content === null ? (
        <pre className="min-h-0 flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed">
          {`File not found: ${path}`}
        </pre>
      ) : html ? (
        // Shiki output is generated from the file content (escaped), so the
        // markup is trusted. [&>pre] styling makes its <pre> fill and scroll.
        <div
          className="min-h-0 flex-1 overflow-auto p-4 text-xs leading-relaxed [&>pre]:bg-transparent! [&>pre]:font-mono"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="min-h-0 flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed">
          {content}
        </pre>
      )}
    </div>
  );
}
