'use client';

import { useHighlightedCode } from './use-highlighted-code';

type CodeBodyProps = {
  /** The text to show, or null when there is nothing to render. */
  content: string | null;
  /** Path used to pick the Shiki language (and for the not-found message). */
  path: string;
};

/**
 * The scrollable pane body: Shiki-highlighted code, falling back to raw text
 * while highlighting resolves, or a not-found line when content is null.
 * Shared by the file and draft viewers.
 */
export function CodeBody({ content, path }: CodeBodyProps) {
  const html = useHighlightedCode(content, path);

  if (content === null) {
    return (
      <pre className="min-h-0 flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed">
        {`File not found: ${path}`}
      </pre>
    );
  }
  if (html) {
    // Shiki output is generated from the file content (escaped), so the markup
    // is trusted. [&>pre] styling makes its <pre> fill and scroll.
    return (
      <div
        className="min-h-0 flex-1 overflow-auto p-4 text-xs leading-relaxed [&>pre]:bg-transparent! [&>pre]:font-mono"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return (
    <pre className="min-h-0 flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed">
      {content}
    </pre>
  );
}
