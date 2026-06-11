'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type OverwriteReadmeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

/**
 * Confirms overwriting an existing README. Controlled (no trigger): the save
 * click decides whether to open it. Only used on the directory-handle write
 * path, which replaces the file in place with no OS dialog of its own.
 */
export function OverwriteReadmeDialog({
  open,
  onOpenChange,
  onConfirm,
}: OverwriteReadmeDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Overwrite the existing README?</AlertDialogTitle>
          <AlertDialogDescription>
            This project already has a README.md. Saving will replace its
            current contents. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Overwrite README
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
