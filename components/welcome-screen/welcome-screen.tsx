'use client';

import { FolderPicker } from '@/components/folder-picker';

type WelcomeScreenProps = {
  /** Open the OS folder picker to load a project. */
  onPickFolder: () => void;
  /** A load error to surface (e.g. permission denied, empty folder), or null. */
  error: string | null;
};

/**
 * The pre-project state: a centered prompt explaining the app and a folder
 * picker. Shown until a project is loaded, after which Home renders the
 * workspace (tree | viewer | chat).
 */
export function WelcomeScreen({ onPickFolder, error }: WelcomeScreenProps) {
  return (
    <div className="flex h-dvh max-h-dvh items-center justify-center overflow-hidden bg-background p-4">
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            README Assistant
          </h1>
          <p className="text-sm text-muted-foreground">
            Add a project folder to get started. The assistant reads your files
            and helps you write or improve its README, then saves it back to
            disk.
          </p>
        </div>
        <FolderPicker onPickFolder={onPickFolder} />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
