'use client';

import { useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
  type UIMessage,
} from 'ai';
import type { Project } from '@/lib/project';
import { stripOuterFence } from '@/agent/strip-fence';
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
   * Append a history marker recording an out-of-band event (e.g. a save). It's
   * a real message the model sees on the next turn, rendered as a UI chip.
   */
  addMarker: (text: string) => void;
  /** Clear the conversation from state and storage (e.g. on project removal). */
  reset: () => void;
};

// Marker messages are identified by this id prefix — the UI renders them as
// chips (see marker-message) instead of chat bubbles. A monotonic counter keeps
// React keys stable; markers are few and the page is the only caller, so
// session-uniqueness is enough.
export const MARKER_ID_PREFIX = 'marker-';
let markerSeq = 0;

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

  // Same pattern for the propose callback: a ref keeps the latest closure
  // available to onToolCall without re-creating the chat.
  const onProposeReadmeRef = useRef(onProposeReadme);
  useEffect(() => {
    onProposeReadmeRef.current = onProposeReadme;
  }, [onProposeReadme]);

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
      // prepareSendMessagesRequest reads projectRef.current at request time (a
      // deferred callback), not during render — the ref feeds the chat fresh
      // state without re-creating it.
      // eslint-disable-next-line react-hooks/refs -- ref read in a deferred callback, not render
      transport: new DefaultChatTransport({
        api: '/api/chat',
        // Runs on every request. We only signal whether a project is loaded;
        // the model discovers paths via listFiles.
        prepareSendMessagesRequest({ messages, body }) {
          return {
            body: {
              ...body,
              // Markers ARE forwarded: they carry real text (e.g. that the user
              // saved the README) the model needs as context. They render as
              // chips in the UI but read as plain messages to the model.
              messages,
              hasProject: !!projectRef.current?.files.length,
            },
          };
        },
      }),
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
      // All tools resolve on the client, synchronously, through the shared
      // resolveToolCall dispatcher (the same one the eval harness uses).
      onToolCall({ toolCall }) {
        const name = toolCall.toolName as ToolName;

        // proposeReadme also opens the staged draft in the viewer — the one
        // side effect beyond returning a tool result.
        if (name === 'proposeReadme') {
          const { content } = toolCall.input as ProposeReadmeInput;
          onProposeReadmeRef.current(stripOuterFence(content));
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

  // Append a history marker (e.g. "Saved README.md to disk"). It's a synthetic
  // message recording an out-of-band event the model didn't drive (a save
  // button click). We give it a real text part and a user role so it's INCLUDED
  // when the history is converted to model messages — otherwise the model never
  // learns the user saved and re-prompts them to. The UI keys off the marker-
  // id prefix to render it as a chip rather than a user bubble (see
  // marker-message).
  const addMarker = (text: string) => {
    markerSeq += 1;
    setMessages((prev) => [
      ...prev,
      {
        id: `${MARKER_ID_PREFIX}${markerSeq}`,
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
    addMarker,
    reset,
  };
}
