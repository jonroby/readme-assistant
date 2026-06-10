'use client';

import type { UIMessage } from 'ai';
import Markdown from 'react-markdown';
import { stripOuterFence } from '@/agent/strip-fence';

type ChatMessageProps = {
  message: UIMessage;
};

/** One-line "what the agent is doing" label for a tool-call part. */
function toolActivityLabel(part: {
  type: string;
  input?: { path?: string; prefix?: string; query?: string };
}): string {
  switch (part.type) {
    case 'tool-writeReadme':
      return '✍️ Writing README…';
    case 'tool-findExistingReadme':
      return '🔍 Checking for an existing README…';
    case 'tool-listFiles':
      return `🗂️ Listing files${part.input?.prefix ? ` in ${part.input.prefix}` : ''}…`;
    case 'tool-searchFiles':
      return `🔎 Searching for "${part.input?.query ?? ''}"…`;
    case 'tool-readFile':
    default:
      return `📄 Reading ${part.input?.path ?? 'file'}…`;
  }
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  // Hide assistant bubbles that have no visible content yet (e.g. only a
  // tool-call in flight) — the tool-call line below renders separately.
  const hasText = message.parts.some(
    (p) => p.type === 'text' && p.text.length > 0,
  );
  // react-markdown takes one string, so join the text parts.
  const assistantText = stripOuterFence(
    message.parts.map((p) => (p.type === 'text' ? p.text : '')).join(''),
  );
  const toolCalls = message.parts.filter((p) =>
    p.type.startsWith('tool-'),
  ) as Array<{
    type: string;
    input?: { path?: string; prefix?: string; query?: string };
  }>;

  return (
    <div className="flex flex-col gap-2">
      {toolCalls.map((part, i) => (
        <span key={`tool-${i}`} className="text-xs text-muted-foreground">
          {toolActivityLabel(part)}
        </span>
      ))}
      {hasText &&
        (isUser ? (
          <div className="max-w-[80%] self-end rounded-lg bg-primary px-4 py-2 text-primary-foreground">
            {message.parts.map((part, i) =>
              part.type === 'text' ? <span key={i}>{part.text}</span> : null,
            )}
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert min-w-0 max-w-full break-words text-foreground prose-pre:whitespace-pre-wrap">
            <Markdown>{assistantText}</Markdown>
          </div>
        ))}
    </div>
  );
}
