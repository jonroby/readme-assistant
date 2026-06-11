'use client';

import { forwardRef, useImperativeHandle } from 'react';
import type { Project } from '@/lib/project';
import { useChatSession } from '@/app/home/hooks/use-chat-session';
import { MessageList } from '@/components/message-list';
import { ChatInput } from '@/components/chat-input';

/**
 * Imperative handle the parent uses for out-of-band actions on the chat — ones
 * that aren't data flow: appending a save marker after a disk write, and
 * resetting the conversation on project teardown.
 */
export type ChatPanelHandle = {
  /** Append a history marker (e.g. "Saved the README…") the model also sees. */
  addMarker: (text: string) => void;
  /** Clear the conversation from state and storage. */
  reset: () => void;
};

type ChatPanelProps = {
  /** The loaded project — gives the chat its file-resolving tools. */
  project: Project;
  /** Open a model-proposed README draft in the viewer. */
  onProposeReadme: (content: string) => void;
};

/**
 * The chat column: owns the LLM conversation (useChatSession / useChat live
 * here, not at the app root). Keeping the chat in its own component contains
 * streaming re-renders to this subtree — the file tree and viewer don't
 * re-render on every token. The parent reaches in only for the two imperative
 * actions exposed via ref (see ChatPanelHandle).
 */
export const ChatPanel = forwardRef<ChatPanelHandle, ChatPanelProps>(
  function ChatPanel({ project, onProposeReadme }, ref) {
    const chat = useChatSession(project, onProposeReadme);

    useImperativeHandle(
      ref,
      () => ({ addMarker: chat.addMarker, reset: chat.reset }),
      [chat.addMarker, chat.reset],
    );

    const handleSend = (text: string) => chat.sendMessage({ text });

    return (
      <>
        <MessageList
          messages={chat.messages}
          emptyText="Ask a question about your project."
        />

        {chat.error && (
          <p className="text-sm text-destructive">
            Something went wrong with that request. Please try again.
          </p>
        )}

        <ChatInput
          onSend={handleSend}
          disabled={chat.busy}
          placeholder="Ask about your project..."
        />
      </>
    );
  },
);
