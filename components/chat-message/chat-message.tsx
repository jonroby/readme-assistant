'use client';

import type { UIMessage } from 'ai';
import { AssistantMessage } from './assistant-message';
import { UserMessage } from './user-message';

type ChatMessageProps = {
  message: UIMessage;
  // Save the README staged by this message. Present only when a project is
  // loaded; the button stays inline with the message that produced the draft.
  onSaveReadme?: (content: string) => void;
  saveStatus?: string;
};

/** A single chat message — dispatches to the user or assistant renderer. */
export function ChatMessage({
  message,
  onSaveReadme,
  saveStatus,
}: ChatMessageProps) {
  if (message.role === 'user') {
    return <UserMessage message={message} />;
  }
  return (
    <AssistantMessage
      message={message}
      onSaveReadme={onSaveReadme}
      saveStatus={saveStatus}
    />
  );
}
