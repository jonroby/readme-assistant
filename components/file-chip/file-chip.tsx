'use client';

import { FolderOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatBytes } from '@/lib/project';

type FileChipProps = {
  fileCount: number;
  totalBytes: number;
  onRemove: () => void;
};

export function FileChip({ fileCount, totalBytes, onRemove }: FileChipProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3">
      <div className="flex items-center gap-3 overflow-hidden">
        <FolderOpen className="size-5 shrink-0 text-muted-foreground" />
        <span className="truncate text-sm font-medium">
          {fileCount} {fileCount === 1 ? 'file' : 'files'} ·{' '}
          {formatBytes(totalBytes)}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        aria-label="Remove project"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
