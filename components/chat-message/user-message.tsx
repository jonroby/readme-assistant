'use client';

import type { UIMessage } from 'ai';

/** A user message: a single right-aligned text bubble. */
export function UserMessage({ message }: { message: UIMessage }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="max-w-[80%] self-end rounded-lg bg-primary px-4 py-2 text-primary-foreground">
        {message.parts.map((part, i) =>
          part.type === 'text' ? <span key={i}>{part.text}</span> : null,
        )}
      </div>
    </div>
  );
}
