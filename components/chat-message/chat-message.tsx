'use client';

import type { UIMessage } from 'ai';

type ChatMessageProps = {
  message: UIMessage;
};

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  return (
    <div
      className={
        isUser
          ? 'max-w-[80%] self-end rounded-lg bg-primary px-4 py-2 text-primary-foreground'
          : 'max-w-[80%] self-start rounded-lg bg-muted px-4 py-2 text-foreground'
      }
    >
      {message.parts.map((part, i) =>
        part.type === 'text' ? <span key={i}>{part.text}</span> : null,
      )}
    </div>
  );
}
