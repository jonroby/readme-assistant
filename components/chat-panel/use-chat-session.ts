'use client';

import { useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
  type UIMessage,
} from 'ai';
import type { Project } from '@/lib/project';
import { stripOuterFence } from '@/lib/strip-fence';
import { USER_ACTION_PREFIX } from '@/components/chat-message/user-action-message';
import {
  resolveToolCall,
  type ProposeReadmeInput,
  type ToolInputs,
  type ToolName,
} from '@/agent/tools';
import {
  clearConversation,
  loadConversation,
  saveConversation,
} from '@/storage';

type UseChatSession = {
  messages: UIMessage[];
  sendMessage: (message: { text: string }) => void;
  busy: boolean;
  /** The last request error (model/transport failure), or null. */
  error: Error | null;
  /**
   * Inject a synthetic user message into the conversation — a real
   * `{ role: 'user', text }` the model reads as context, recording an
   * out-of-band event (e.g. "Saved the README to disk") that the user did via
   * the UI rather than by typing. Rendered as a chip, not a chat bubble.
   */
  addCustomMessage: (text: string) => void;
  /** Clear the conversation from state and storage (e.g. on project removal). */
  reset: () => void;
};

// A monotonic counter keeps injected-message React keys stable; they're few and
// the page is the only caller, so session-uniqueness is enough. (USER_ACTION_PREFIX
// is owned by user-action-message, the renderer that keys off it.)
let userActionSeq = 0;

/**
 * Owns the chat: the useChat instance, client-side tool resolution, and
 * conversation persistence. Takes the live project so the in-flight chat
 * callbacks see fresh state without re-creating the chat. `onProposeReadme`
 * fires when the model stages a README, so the app can open it in the viewer.
 */
export function useChatSession(
  project: Project | null,
  onProposeReadme: (content: string) => void,
): UseChatSession {
  // onToolCall and the transport read the latest project at call time. A ref
  // keeps it current without re-creating the chat; synced in an effect.
  const projectRef = useRef<Project | null>(null);
  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  const {
    messages,
    sendMessage,
    setMessages,
    stop,
    addToolOutput,
    status,
    error,
  } = useChat({
      // Surfaces request failures (model/transport errors — a dropped network
      // call, a 5xx, a rate limit). The SDK already exposes `error`; we log
      // here for debugging and render `error` in the chat for the user.
      onError(err) {
        console.error('Chat request failed:', err);
      },
      // Default transport: the SDK sends the full message history to /api/chat
      // (injected user-action messages included — they're real messages the
      // model should see). The
      // server always uses the README prompt since the chat only exists once a
      // project is loaded, so no per-request body shaping is needed.
      transport: new DefaultChatTransport({ api: '/api/chat' }),
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
      // All tools resolve on the client, synchronously, through the shared
      // resolveToolCall dispatcher (the same one the eval harness uses).
      onToolCall({ toolCall }) {
        const name = toolCall.toolName as ToolName;

        // proposeReadme also opens the staged draft in the viewer — the one
        // side effect beyond returning a tool result.
        if (name === 'proposeReadme') {
          const { content } = toolCall.input as ProposeReadmeInput;
          // onProposeReadme has a stable identity (see useApp.openDraft), so
          // calling it directly from this once-captured callback is safe — no
          // ref needed.
          onProposeReadme(stripOuterFence(content));
        }

        addToolOutput({
          tool: name,
          toolCallId: toolCall.toolCallId,
          output: resolveToolCall(
            name,
            toolCall.input as ToolInputs[ToolName],
            projectRef.current,
          ),
        });
      },
    });

  const busy = status === 'streaming' || status === 'submitted';

  // True once the initial restore has run, so the persist effect doesn't
  // overwrite saved messages with the empty starting state on first render.
  const restored = useRef(false);

  useEffect(() => {
    const saved = loadConversation();
    if (saved.length) setMessages(saved);
    restored.current = true;
  }, [setMessages]);

  useEffect(() => {
    if (restored.current) saveConversation(messages);
  }, [messages]);

  // Inject a synthetic user message (e.g. "Saved README.md to disk") recording
  // an out-of-band event the model didn't drive (a save button click). It's a
  // real user-role text message so it's INCLUDED when the history is converted
  // to model messages — otherwise the model never learns the user saved and
  // re-prompts them to. The UI keys off the user-action- id prefix to render it
  // as a chip rather than a user bubble (see user-action-message).
  const addCustomMessage = (text: string) => {
    userActionSeq += 1;
    setMessages((prev) => [
      ...prev,
      {
        id: `${USER_ACTION_PREFIX}${userActionSeq}`,
        role: 'user',
        parts: [{ type: 'text', text }],
      } as UIMessage,
    ]);
  };

  const reset = () => {
    stop();
    clearConversation();
    setMessages([]);
  };

  return {
    messages,
    sendMessage,
    busy,
    error: error ?? null,
    addCustomMessage,
    reset,
  };
}
