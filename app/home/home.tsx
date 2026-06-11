'use client';

import { useState } from 'react';
import { Dropzone } from '@/components/dropzone';
import { FileTree } from '@/components/file-tree';
import { FileViewer } from '@/components/file-viewer';
import { MessageList } from '@/components/message-list';
import { ChatInput } from '@/components/chat-input';
import { OverwriteReadmeDialog } from '@/components/overwrite-readme-dialog';
import { supportsDirectoryAccess } from '@/lib/directory';
import { cn } from '@/lib/utils';
import { useProject } from './hooks/use-project';
import { useChatSession } from './hooks/use-chat-session';
import { useReadmeSaver } from './hooks/use-readme-saver';

export function Home() {
  const { project, dirHandle, error, loadFromFiles, pickFolder, clear } =
    useProject();
  const { messages, sendMessage, busy, reset: resetChat } =
    useChatSession(project);
  const saver = useReadmeSaver(dirHandle, project);

  // Path of the file open in the viewer, or null. When set, the layout splits:
  // tree | file viewer | chat. Only one file is viewed at a time.
  const [openFile, setOpenFile] = useState<string | null>(null);

  // Clearing the project tears down every concern: project, chat, saves, viewer.
  const handleRemove = () => {
    clear();
    resetChat();
    saver.reset();
    setOpenFile(null);
  };

  const handleSend = (text: string) => {
    if (project) sendMessage({ text });
  };

  // No project yet: a single centered prompt to upload one. Picking a folder
  // reveals the workspace (tree | viewer | chat).
  if (!project) {
    return (
      <div className="flex h-dvh max-h-dvh items-center justify-center overflow-hidden bg-background p-4">
        <div className="flex w-full max-w-md flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              README Assistant
            </h1>
            <p className="text-sm text-muted-foreground">
              Add a project folder to get started. The assistant reads your
              files and helps you write or improve its README, then saves it
              back to disk.
            </p>
          </div>
          <Dropzone
            onFiles={loadFromFiles}
            onPickDirectory={supportsDirectoryAccess() ? pickFolder : undefined}
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
          onSaveReadme={saver.save}
          saveStatus={saver.saveStatus}
        />

        <ChatInput
          onSend={handleSend}
          disabled={busy}
          placeholder="Ask about your project..."
        />
      </main>
      <OverwriteReadmeDialog
        open={saver.pendingSave !== null}
        onOpenChange={(open) => {
          if (!open) saver.cancelOverwrite();
        }}
        onConfirm={saver.confirmOverwrite}
      />
    </div>
  );
}
