'use client';

import { FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type FileChipProps = {
  fileName: string;
  onRemove: () => void;
};

export function FileChip({ fileName, onRemove }: FileChipProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3">
      <div className="flex items-center gap-3 overflow-hidden">
        <FileText className="size-5 shrink-0 text-muted-foreground" />
        <span className="truncate text-sm font-medium">{fileName}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        aria-label="Remove file"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
