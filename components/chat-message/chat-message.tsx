'use client';

import type { UIMessage } from 'ai';
import { AssistantMessage } from './assistant-message';
import { UserMessage } from './user-message';
import { MarkerMessage, getMarkerText } from './marker-message';

/** A single chat message — dispatches to the user, assistant, or marker renderer. */
export function ChatMessage({ message }: { message: UIMessage }) {
  const marker = getMarkerText(message);
  if (marker !== null) {
    return <MarkerMessage text={marker} />;
  }
  if (message.role === 'user') {
    return <UserMessage message={message} />;
  }
  return <AssistantMessage message={message} />;
}
