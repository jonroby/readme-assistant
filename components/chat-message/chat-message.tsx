'use client';

import type { UIMessage } from 'ai';
import { AssistantMessage } from './assistant-message';
import { UserMessage } from './user-message';

/** A single chat message — dispatches to the user or assistant renderer. */
export function ChatMessage({ message }: { message: UIMessage }) {
  if (message.role === 'user') {
    return <UserMessage message={message} />;
  }
  return <AssistantMessage message={message} />;
}
