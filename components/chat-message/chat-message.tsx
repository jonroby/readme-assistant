'use client';

import type { UIMessage } from 'ai';
import { AssistantMessage } from './assistant-message';
import { UserMessage } from './user-message';
import { UserActionMessage, getUserActionText } from './user-action-message';

/** A single chat message — dispatches to the user, assistant, or user-action renderer. */
export function ChatMessage({ message }: { message: UIMessage }) {
  const userAction = getUserActionText(message);
  if (userAction !== null) {
    return <UserActionMessage text={userAction} />;
  }
  if (message.role === 'user') {
    return <UserMessage message={message} />;
  }
  return <AssistantMessage message={message} />;
}
