'use client';

import { useState } from 'react';
import { findReadme, type Project } from '@/lib/project';
import type { DirectoryHandle } from '@/lib/directory';
import { writeFileToDirectory, ensurePermission } from '@/storage';
import { saveReadmeToDisk } from '@/agent/tools';

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
 * Owns the README save flow: which write path to take, the overwrite-confirm
 * gate on the directory-handle path (which has no OS dialog), and per-message
 * status. The directory-handle write replaces README.md in place.
 */
export function useReadmeSaver(
  dirHandle: DirectoryHandle | null,
  project: Project | null,
): UseReadmeSaver {
  const [saveStatus, setSaveStatus] = useState<Record<string, string>>({});
  const [pendingSave, setPendingSave] = useState<PendingSave | null>(null);

  const report = (messageId: string, status: string) =>
    setSaveStatus((prev) => ({ ...prev, [messageId]: status }));

  // The actual directory-handle write. Needs a user gesture for the permission
  // re-grant, so it runs from a click (the save button or confirm dialog).
  const writeToFolder = async (messageId: string, content: string) => {
    if (!dirHandle) return;
    try {
      if (!(await ensurePermission(dirHandle))) {
        report(messageId, 'Permission to write to the folder was denied.');
        return;
      }
      await writeFileToDirectory(dirHandle, 'README.md', content);
      report(messageId, 'README written to the project folder.');
    } catch (e) {
      report(
        messageId,
        `Failed to write README: ${e instanceof Error ? e.message : 'unknown error'}`,
      );
    }
  };

  const save = async (messageId: string, content: string) => {
    // Directory-handle path: confirm before overwriting an existing README
    // (the handle write has no OS dialog). Otherwise the save-file dialog
    // prompts on overwrite itself.
    if (dirHandle) {
      if (project && findReadme(project)) {
        setPendingSave({ messageId, content });
        return;
      }
      await writeToFolder(messageId, content);
      return;
    }
    report(messageId, await saveReadmeToDisk(content));
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
