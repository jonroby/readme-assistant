'use client';

import { useState } from 'react';
import { findReadme, type Project } from '@/lib/project';
import { writeFileToFolder, ensurePermission } from '@/storage';

type PendingSave = { messageId: string; content: string };

type UseReadmeSaver = {
  /** Last save result, keyed by the message whose README was saved. */
  saveStatus: Record<string, string>;
  /** A save awaiting overwrite confirmation, or null. */
  pendingSave: PendingSave | null;
  /** Save a message's README (may open the overwrite confirm first). */
  save: (messageId: string, content: string) => Promise<void>;
  /** Confirm the pending overwrite and write. */
  confirmOverwrite: () => void;
  /** Dismiss the overwrite confirm without writing. */
  cancelOverwrite: () => void;
  /** Reset all save state (e.g. on project removal). */
  reset: () => void;
};

/**
 * Owns the README save flow: the overwrite-confirm gate (the handle write has
 * no OS dialog, so we confirm before replacing an existing README) and
 * per-message status. Writes README.md in place via the project's handle.
 */
export function useReadmeSaver(project: Project | null): UseReadmeSaver {
  const [saveStatus, setSaveStatus] = useState<Record<string, string>>({});
  const [pendingSave, setPendingSave] = useState<PendingSave | null>(null);

  const report = (messageId: string, status: string) =>
    setSaveStatus((prev) => ({ ...prev, [messageId]: status }));

  // The actual write. Needs a user gesture for the permission re-grant, so it
  // runs from a click (the save button or confirm dialog).
  const writeToFolder = async (messageId: string, content: string) => {
    if (!project) return;
    try {
      if (!(await ensurePermission(project.handle))) {
        report(messageId, 'Permission to write to the folder was denied.');
        return;
      }
      await writeFileToFolder(project.handle, 'README.md', content);
      report(messageId, 'README written to the project folder.');
    } catch (e) {
      report(
        messageId,
        `Failed to write README: ${e instanceof Error ? e.message : 'unknown error'}`,
      );
    }
  };

  const save = async (messageId: string, content: string) => {
    // Confirm before overwriting an existing README (the handle write has no
    // OS dialog to prompt on its own).
    if (project && findReadme(project)) {
      setPendingSave({ messageId, content });
      return;
    }
    await writeToFolder(messageId, content);
  };

  const confirmOverwrite = () => {
    if (pendingSave) {
      void writeToFolder(pendingSave.messageId, pendingSave.content);
      setPendingSave(null);
    }
  };

  const cancelOverwrite = () => setPendingSave(null);

  const reset = () => {
    setSaveStatus({});
    setPendingSave(null);
  };

  return {
    saveStatus,
    pendingSave,
    save,
    confirmOverwrite,
    cancelOverwrite,
    reset,
  };
}
