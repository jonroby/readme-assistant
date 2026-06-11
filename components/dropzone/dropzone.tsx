'use client';

import { FolderOpen } from 'lucide-react';

type DropzoneProps = {
  onPickFolder: () => void;
};

export function Dropzone({ onPickFolder }: DropzoneProps) {
  return (
    <button
      type="button"
      onClick={onPickFolder}
      className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-accent/50"
    >
      <FolderOpen className="size-6 text-muted-foreground" />
      <span className="text-sm font-medium">Choose a project folder</span>
      <span className="text-xs text-muted-foreground">Max 1 MB total</span>
    </button>
  );
}
