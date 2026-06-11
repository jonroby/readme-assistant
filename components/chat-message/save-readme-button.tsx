'use client';

import { Button } from '@/components/ui/button';

type SaveReadmeButtonProps = {
  content: string;
  onSave: (content: string) => void;
  status?: string;
};

/**
 * Inline "Save README to disk" button shown beneath the message that staged a
 * README, with the result of the last save attempt for that message.
 */
export function SaveReadmeButton({
  content,
  onSave,
  status,
}: SaveReadmeButtonProps) {
  return (
    <div className="flex items-center gap-3">
      <Button onClick={() => onSave(content)}>Save README to disk</Button>
      {status && (
        <span className="text-sm text-muted-foreground">{status}</span>
      )}
    </div>
  );
}
