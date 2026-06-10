'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from 'ai';
import { Dropzone } from '@/components/dropzone';
import { FileTree } from '@/components/file-tree';
import { FileViewer } from '@/components/file-viewer';
import { MessageList } from '@/components/message-list';
import { cn } from '@/lib/utils';
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
  runFindExistingReadme,
  runListFiles,
  runReadFile,
  runSearchFiles,
  runWriteReadme,
  saveReadmeToDisk,
  type ListFilesInput,
  type ReadFileInput,
  type SearchFilesInput,
} from '@/agent/tools';

export default function Home() {
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  // The picked project folder, when the browser supports directory access. Kept
  // so we can write the README straight back into the same folder, and persisted
  // in IndexedDB so it survives reloads. Null when using the upload fallback.
  const [dirHandle, setDirHandle] = useState<DirectoryHandle | null>(null);
  // Result of the last save attempt, keyed by the message whose README was
  // saved — so the status shows next to that message's inline Save button.
  const [saveStatus, setSaveStatus] = useState<Record<string, string>>({});
  // Path of the file open in the viewer, or null. When set, the layout splits:
  // tree | file viewer | chat. Only one file is viewed at a time.
  const [openFile, setOpenFile] = useState<string | null>(null);

  // The readFile tool runs on the client, so onToolCall needs the latest
  // project. A ref keeps it current without re-creating the chat.
  const projectRef = useRef<Project | null>(null);
  projectRef.current = project;

  const { messages, sendMessage, setMessages, stop, addToolOutput, status } =
    useChat({
      transport: new DefaultChatTransport({
        api: '/api/chat',
        // Runs on every request (initial + tool-result resume). We only signal
        // whether a project is loaded; the model discovers paths via listFiles.
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
      // All tools resolve on the client. onToolCall is synchronous: the
      // read/list/search tools report immediately; writeReadme does its async
      // save in a .then() that reports when it finishes. Never await here.
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
        } else if (toolCall.toolName === 'writeReadme') {
          // The staged README lives on the message (its writeReadme tool part),
          // so the Save button can render inline; nothing to stash here.
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
    setSaveStatus({});
    setOpenFile(null);
  };

  // Runs on a real click (the gesture both the picker and requestPermission
  // need). With a directory handle we write straight into the project folder;
  // otherwise we fall back to the save-file dialog. Status is keyed by the
  // message whose inline button was clicked.
  const handleSaveReadme = async (messageId: string, content: string) => {
    const report = (status: string) =>
      setSaveStatus((prev) => ({ ...prev, [messageId]: status }));
    if (dirHandle) {
      try {
        if (!(await ensurePermission(dirHandle))) {
          report('Permission to write to the folder was denied.');
          return;
        }
        await writeFileToDirectory(dirHandle, 'README.md', content);
        report('README written to the project folder.');
      } catch (e) {
        report(
          `Failed to write README: ${e instanceof Error ? e.message : 'unknown error'}`,
        );
      }
      return;
    }
    report(await saveReadmeToDisk(content));
  };

  const handleSend = (text: string) => {
    if (!project) return;
    sendMessage({ text });
  };

  // No project yet: a single centered prompt to upload one. Picking a folder
  // reveals the workspace (tree | viewer | chat).
  if (!project) {
    return (
      <div className="flex h-dvh max-h-dvh items-center justify-center overflow-hidden bg-background p-4">
        <div className="flex w-full max-w-md flex-col items-center gap-4">
          <Dropzone
            onFiles={handleFiles}
            onPickDirectory={
              supportsDirectoryAccess() ? handlePickDirectory : undefined
            }
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh max-h-dvh overflow-hidden bg-background">
      <FileTree
        project={project}
        activePath={openFile}
        onSelectFile={setOpenFile}
        onClear={handleRemove}
      />
      {openFile && (
        <FileViewer
          project={project}
          path={openFile}
          onClose={() => setOpenFile(null)}
        />
      )}
      <main
        className={cn(
          'flex min-h-0 flex-col gap-6 px-4 py-8',
          // Centered readable column by default; an even split when a file is
          // open (basis-0 + flex-1 so it and the viewer divide the leftover
          // space equally, regardless of the fixed-width tree).
          openFile ? 'min-w-0 flex-1 basis-0' : 'mx-auto w-full max-w-2xl',
        )}
      >
        {error && <p className="text-sm text-destructive">{error}</p>}

        <MessageList
          messages={messages}
          emptyText="Ask a question about your project."
          onSaveReadme={handleSaveReadme}
          saveStatus={saveStatus}
        />

        <ChatInput
          onSend={handleSend}
          disabled={busy}
          placeholder="Ask about your project..."
        />
      </main>
    </div>
  );
}
