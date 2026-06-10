'use client';

import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

/**
 * Info button explaining that the loaded project is a snapshot: edits made to
 * the files on disk after loading are not reflected here until the project is
 * re-loaded.
 */
export function SnapshotInfo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="About the project snapshot"
        >
          <Info className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="text-muted-foreground">
        This project is a snapshot taken when you loaded it. Editing the files
        on your computer afterwards won&apos;t update what you see here.
        Re-load the folder to pick up changes.
      </PopoverContent>
    </Popover>
  );
}
