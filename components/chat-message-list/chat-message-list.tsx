'use client';

import type { UIMessage } from 'ai';
import { ChatMessage } from '@/components/chat-message';

type ChatMessageListProps = {
  messages: UIMessage[];
  emptyText: string;
};

export function ChatMessageList({ messages, emptyText }: ChatMessageListProps) {
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto pb-6">
      {messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))
      )}
    </div>
  );
}
