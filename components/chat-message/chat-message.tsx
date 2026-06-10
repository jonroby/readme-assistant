'use client';

import type { UIMessage } from 'ai';
import Markdown from 'react-markdown';

type ChatMessageProps = {
  message: UIMessage;
};

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  // Hide assistant bubbles that have no visible content yet (e.g. only a
  // tool-call in flight) — the tool-call line below renders separately.
  const hasText = message.parts.some(
    (p) => p.type === 'text' && p.text.length > 0,
  );
  // react-markdown takes one string, so join the text parts.
  const assistantText = message.parts
    .map((p) => (p.type === 'text' ? p.text : ''))
    .join('');
  const toolCalls = message.parts.filter((p) =>
    p.type.startsWith('tool-'),
  ) as Array<{ type: string; input?: { path?: string } }>;

  return (
    <div className="flex flex-col gap-2">
      {toolCalls.map((part, i) => (
        <span key={`tool-${i}`} className="text-xs text-muted-foreground">
          {part.type === 'tool-writeReadme'
            ? '✍️ Writing README…'
            : `📄 Reading ${part.input?.path ?? 'file'}…`}
        </span>
      ))}
      {hasText &&
        (isUser ? (
          // User messages are plain text, not markdown.
          <div className="max-w-[80%] self-end rounded-lg bg-primary px-4 py-2 text-primary-foreground">
            {message.parts.map((part, i) =>
              part.type === 'text' ? <span key={i}>{part.text}</span> : null,
            )}
          </div>
        ) : (
          // Assistant replies are markdown (READMEs, code, lists) — render them.
          <div className="prose prose-sm dark:prose-invert max-w-none self-start rounded-lg bg-muted px-4 py-2 text-foreground">
            <Markdown>{assistantText}</Markdown>
          </div>
        ))}
    </div>
  );
}
