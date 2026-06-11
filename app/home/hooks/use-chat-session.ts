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
  runFindExistingReadme,
  runListFiles,
  runReadFile,
  runSearchFiles,
  runProposeReadme,
  type ListFilesInput,
  type ProposeReadmeInput,
  type ReadFileInput,
  type SearchFilesInput,
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
  /** Clear the conversation from state and storage (e.g. on project removal). */
  reset: () => void;
};

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

  const { messages, sendMessage, setMessages, stop, addToolOutput, status } =
    useChat({
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
              messages,
              hasProject: !!projectRef.current?.files.length,
            },
          };
        },
      }),
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
      // All tools resolve on the client, synchronously.
      onToolCall({ toolCall }) {
        if (toolCall.toolName === 'findExistingReadme') {
          addToolOutput({
            tool: 'findExistingReadme',
            toolCallId: toolCall.toolCallId,
            output: runFindExistingReadme(projectRef.current),
          });
        } else if (toolCall.toolName === 'listFiles') {
          addToolOutput({
            tool: 'listFiles',
            toolCallId: toolCall.toolCallId,
            output: runListFiles(
              toolCall.input as ListFilesInput,
              projectRef.current,
            ),
          });
        } else if (toolCall.toolName === 'searchFiles') {
          addToolOutput({
            tool: 'searchFiles',
            toolCallId: toolCall.toolCallId,
            output: runSearchFiles(
              toolCall.input as SearchFilesInput,
              projectRef.current,
            ),
          });
        } else if (toolCall.toolName === 'readFile') {
          addToolOutput({
            tool: 'readFile',
            toolCallId: toolCall.toolCallId,
            output: runReadFile(
              toolCall.input as ReadFileInput,
              projectRef.current,
            ),
          });
        } else if (toolCall.toolName === 'proposeReadme') {
          // The staged README lives on the message (its proposeReadme tool
          // part); also open it in the viewer so the user reads it there.
          const { content } = toolCall.input as ProposeReadmeInput;
          onProposeReadmeRef.current(stripOuterFence(content));
          addToolOutput({
            tool: 'proposeReadme',
            toolCallId: toolCall.toolCallId,
            output: runProposeReadme(),
          });
        }
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

  const reset = () => {
    stop();
    clearConversation();
    setMessages([]);
  };

  return { messages, sendMessage, busy, reset };
}
