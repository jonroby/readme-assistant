'use client';

import type { UIMessage } from 'ai';
import { ChatMessage } from '@/components/chat-message';

type MessageListProps = {
  messages: UIMessage[];
  emptyText: string;
  // Save the README staged by a given message. Present only when a project is
  // loaded. saveStatus is keyed by message id so each inline button shows its
  // own result.
  onSaveReadme?: (messageId: string, content: string) => void;
  saveStatus?: Record<string, string>;
};

export function MessageList({
  messages,
  emptyText,
  onSaveReadme,
  saveStatus,
}: MessageListProps) {
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto pb-6">
      {messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onSaveReadme={
              onSaveReadme
                ? (content) => onSaveReadme(message.id, content)
                : undefined
            }
            saveStatus={saveStatus?.[message.id]}
          />
        ))
      )}
    </div>
  );
}
