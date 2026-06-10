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
  ensurePermission,
  pickDirectory,
  readDirectoryProject,
  supportsDirectoryAccess,
  writeFileToDirectory,
  type DirectoryHandle,
} from '@/lib/directory';
import { clearHandle, loadHandle, saveHandle } from '@/lib/handle-store';
import {
  runReadFile,
  runWriteReadme,
  saveReadmeToDisk,
  type ReadFileInput,
  type WriteReadmeInput,
} from '@/agent/tools';
import { Button } from '@/components/ui/button';
import { stripOuterFence } from '@/agent/strip-fence';

export default function Home() {
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  // The picked project folder, when the browser supports directory access. Kept
  // so we can write the README straight back into the same folder, and persisted
  // in IndexedDB so it survives reloads. Null when using the upload fallback.
  const [dirHandle, setDirHandle] = useState<DirectoryHandle | null>(null);
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
          setStagedReadme(stripOuterFence(content));
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

  // Restore a previously loaded project: file contents from localStorage (for
  // the chat loop) and, if present, the directory handle from IndexedDB (for
  // write-back). The handle's permission re-grant is deferred to a user click.
  useEffect(() => {
    setProject(loadProject());
    loadHandle().then((handle) => {
      if (handle) setDirHandle(handle);
    });
  }, []);

  // Upload fallback (non-Chromium): read File[] into the project, no handle.
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

  // Preferred path (Chromium): pick a folder via the directory picker. Gives a
  // writable handle we persist, so the README can be written back into it.
  const handlePickDirectory = async () => {
    setError(null);
    try {
      const handle = await pickDirectory();
      if (!(await ensurePermission(handle))) {
        setError('Permission to access the folder was denied.');
        return;
      }
      const next = await readDirectoryProject(handle);
      saveProject(next);
      await saveHandle(handle);
      setProject(next);
      setDirHandle(handle);
    } catch (e) {
      // AbortError = user cancelled the folder picker; not an error.
      if (e instanceof DOMException && e.name === 'AbortError') return;
      setError(e instanceof Error ? e.message : 'Failed to read folder.');
    }
  };

  const handleRemove = () => {
    stop();
    clearProject();
    clearHandle();
    setProject(null);
    setDirHandle(null);
    setMessages([]);
    setStagedReadme(null);
    setSaveStatus(null);
  };

  // Runs on a real click (the gesture both the picker and requestPermission
  // need). With a directory handle we write straight into the project folder;
  // otherwise we fall back to the save-file dialog.
  const handleSaveReadme = async () => {
    if (!stagedReadme) return;
    if (dirHandle) {
      try {
        if (!(await ensurePermission(dirHandle))) {
          setSaveStatus('Permission to write to the folder was denied.');
          return;
        }
        await writeFileToDirectory(dirHandle, 'README.md', stagedReadme);
        setSaveStatus('README written to the project folder.');
      } catch (e) {
        setSaveStatus(
          `Failed to write README: ${e instanceof Error ? e.message : 'unknown error'}`,
        );
      }
      return;
    }
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
          onPickDirectory={
            supportsDirectoryAccess() ? handlePickDirectory : undefined
          }
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
