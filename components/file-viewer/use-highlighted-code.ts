'use client';

import { useEffect, useState } from 'react';
import { codeToHtml } from 'shiki';
import { langFromPath } from './lang';

/**
 * Syntax-highlight a file's content with Shiki (async). Returns the highlighted
 * HTML, or null while it resolves / on failure (caller shows raw text then).
 * The result is tagged with the path it was produced for, so a stale result
 * from a previously-open file is never returned.
 */
export function useHighlightedCode(
  content: string | null,
  path: string,
): string | null {
  const [highlight, setHighlight] = useState<{ path: string; html: string }>();

  useEffect(() => {
    if (content === null) return;
    let active = true;
    codeToHtml(content, { lang: langFromPath(path), theme: 'github-light' })
      .then((out) => {
        if (active) setHighlight({ path, html: out });
      })
      .catch(() => {}); // leave raw text showing on failure
    return () => {
      active = false;
    };
  }, [content, path]);

  return highlight?.path === path ? highlight.html : null;
}
