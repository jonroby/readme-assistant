'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from 'ai';
import { FileUpload } from '@/components/file-upload';
import { MessageList } from '@/components/message-list';
import { ChatInput } from '@/components/chat-input';
import {
  clearProject,
  loadProject,
  readProject,
  saveProject,
  type Project,
} from '@/lib/project';
import {
  runReadFile,
  runWriteReadme,
  saveReadmeToDisk,
  type ReadFileInput,
  type WriteReadmeInput,
} from '@/agent/tools';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  // README content the model staged via writeReadme, awaiting a user click to
  // write to disk (showSaveFilePicker needs a gesture — see saveReadmeToDisk).
  const [stagedReadme, setStagedReadme] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // The readFile tool runs on the client, so onToolCall needs the latest
  // project. A ref keeps it current without re-creating the chat.
  const projectRef = useRef<Project | null>(null);
  projectRef.current = project;

  const { messages, sendMessage, setMessages, stop, addToolOutput, status } =
    useChat({
      transport: new DefaultChatTransport({
        api: '/api/chat',
        // Runs on every request (initial + tool-result resume), so the file
        // list is always present — not just on the first message.
        prepareSendMessagesRequest({ messages, body }) {
          return {
            body: {
              ...body,
              messages,
              paths: projectRef.current?.files.map((f) => f.path) ?? [],
            },
          };
        },
      }),
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
      // Both tools resolve on the client. onToolCall is synchronous: readFile
      // reports immediately; writeReadme does its async save in a .then() that
      // reports when it finishes. We never await inside onToolCall.
      onToolCall({ toolCall }) {
        if (toolCall.toolName === 'readFile') {
          addToolOutput({
            tool: 'readFile',
            toolCallId: toolCall.toolCallId,
            output: runReadFile(
              toolCall.input as ReadFileInput,
              projectRef.current,
            ),
          });
        } else if (toolCall.toolName === 'writeReadme') {
          const { content } = toolCall.input as WriteReadmeInput;
          // Stage the README for the user to save; the disk write needs a click.
          setStagedReadme(content);
          setSaveStatus(null);
          addToolOutput({
            tool: 'writeReadme',
            toolCallId: toolCall.toolCallId,
            output: runWriteReadme(),
          });
        }
      },
    });

  const busy = status === 'streaming' || status === 'submitted';

  // Restore a previously uploaded project from localStorage.
  useEffect(() => {
    setProject(loadProject());
  }, []);

  const handleFiles = async (files: File[]) => {
    setError(null);
    try {
      const next = await readProject(files);
      saveProject(next);
      setProject(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to read project.');
    }
  };

  const handleRemove = () => {
    stop();
    clearProject();
    setProject(null);
    setMessages([]);
    setStagedReadme(null);
    setSaveStatus(null);
  };

  // Runs on a real click, so showSaveFilePicker has its required user gesture.
  const handleSaveReadme = async () => {
    if (!stagedReadme) return;
    setSaveStatus(await saveReadmeToDisk(stagedReadme));
  };

  const handleSend = (text: string) => {
    if (!project) return;
    sendMessage({ text });
  };

  return (
    <div className="flex flex-1 flex-col items-center bg-background">
      <main className="flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
        <FileUpload
          project={project}
          onFiles={handleFiles}
          onRemove={handleRemove}
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <MessageList
          messages={messages}
          emptyText={
            project
              ? 'Ask a question about your project.'
              : 'Upload a project folder to get started.'
          }
        />

        {stagedReadme && (
          <div className="flex items-center gap-3">
            <Button onClick={handleSaveReadme}>Save README to disk</Button>
            {saveStatus && (
              <span className="text-sm text-muted-foreground">{saveStatus}</span>
            )}
          </div>
        )}

        <ChatInput
          onSend={handleSend}
          disabled={!project || busy}
          placeholder={
            project ? 'Ask about your project...' : 'Upload a project first'
          }
        />
      </main>
    </div>
  );
}
