'use client';

import { FolderPicker } from '@/components/folder-picker';
import { FileTree } from '@/components/file-tree';
import { FileViewer, DraftViewer } from '@/components/file-viewer';
import { ChatPanel } from '@/components/chat-panel';
import { OverwriteReadmeDialog } from '@/components/overwrite-readme-dialog';
import { cn } from '@/lib/utils';
import { findReadme } from '@/lib/project';
import { useApp } from './hooks/use-app';

export function Home() {
  const { project: projectState, chatRef, saver, view, clear } = useApp();
  const { project, error, pickFolder } = projectState;
  const { openFile, draft, openDraft, setOpenFile, closeViewer } = view;
  // The center viewer is open for either a real file or a staged README draft.
  const viewerOpen = openFile !== null || draft !== null;

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
          <FolderPicker onPickFolder={pickFolder} />
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
        onClear={clear}
      />
      {draft !== null ? (
        <DraftViewer
          draft={draft}
          // Existing README to diff the draft against (null if none → no diff).
          base={findReadme(project)?.content ?? null}
          onClose={closeViewer}
          onSave={saver.save}
          saveStatus={saver.saveStatus}
        />
      ) : openFile !== null ? (
        <FileViewer project={project} path={openFile} onClose={closeViewer} />
      ) : null}
      <main
        className={cn(
          'flex min-h-0 flex-col gap-6 px-4 py-8',
          // Centered readable column by default; an even split when the viewer
          // is open (basis-0 + flex-1 so it and the viewer divide the leftover
          // space equally, regardless of the fixed-width tree).
          viewerOpen ? 'min-w-0 flex-1 basis-0' : 'mx-auto w-full max-w-3xl',
        )}
      >
        {error && <p className="text-sm text-destructive">{error}</p>}

        <ChatPanel
          ref={chatRef}
          project={project}
          onProposeReadme={openDraft}
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
