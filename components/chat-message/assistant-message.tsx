'use client';

import type { UIMessage } from 'ai';
import Markdown from 'react-markdown';
import { stripOuterFence } from '@/lib/strip-fence';
import { ToolActivity, type ToolPart } from './tool-activity';

/**
 * An assistant message. Renders message.parts in their true chronological
 * order — tool-activity lines interleave with text exactly as they happened.
 * A staged README is not shown here; it opens in the file viewer, where its
 * Save control lives.
 */
export function AssistantMessage({ message }: { message: UIMessage }) {
  return (
    <div className="flex flex-col gap-2">
      {message.parts.map((part, i) => {
        if (part.type === 'text') {
          if (!part.text) return null;
          return (
            <div
              key={i}
              className="prose prose-sm dark:prose-invert min-w-0 max-w-full break-words text-foreground prose-pre:whitespace-pre-wrap"
            >
              <Markdown>{stripOuterFence(part.text)}</Markdown>
            </div>
          );
        }
        if (part.type.startsWith('tool-')) {
          return <ToolActivity key={i} part={part as ToolPart} />;
        }
        return null;
      })}
    </div>
  );
}
