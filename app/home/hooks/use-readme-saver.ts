'use client';

import { useState } from 'react';
import { findReadme, type Project } from '@/lib/project';
import { writeFileToFolder, ensurePermission } from '@/storage';

/** The outcome of a save attempt: whether it wrote, plus a message to show. */
export type SaveResult = { ok: boolean; message: string };

type UseReadmeSaver = {
  /** Result of the last save attempt, or null before any. */
  saveStatus: SaveResult | null;
  /** A save awaiting overwrite confirmation, or null. */
  pendingSave: { content: string } | null;
  /** Save a README draft (may open the overwrite confirm first). */
  save: (content: string) => Promise<void>;
  /** Confirm the pending overwrite and write. */
  confirmOverwrite: () => void;
  /** Dismiss the overwrite confirm without writing. */
  cancelOverwrite: () => void;
  /** Clear the last save status (e.g. when a new draft is proposed). */
  clearStatus: () => void;
  /** Reset all save state (e.g. on project removal). */
  reset: () => void;
};

/**
 * Owns the README save flow: the overwrite-confirm gate (the handle write has
 * no OS dialog, so we confirm before replacing an existing README) and the
 * last save status. There is one draft open at a time, so the status is a
 * single value. Writes README.md in place via the project's handle.
 *
 * `onSaved` fires with the written content after a successful disk write, so
 * the caller can reflect it into the in-memory project snapshot.
 */
export function useReadmeSaver(
  project: Project | null,
  onSaved: (content: string) => void,
): UseReadmeSaver {
  const [saveStatus, setSaveStatus] = useState<SaveResult | null>(null);
  const [pendingSave, setPendingSave] = useState<{ content: string } | null>(
    null,
  );

  // The actual write. Needs a user gesture for the permission re-grant, so it
  // runs from a click (the save button or confirm dialog).
  const writeToFolder = async (content: string) => {
    if (!project) return;
    try {
      if (!(await ensurePermission(project.handle))) {
        setSaveStatus({
          ok: false,
          message: 'Permission to write to the folder was denied.',
        });
        return;
      }
      await writeFileToFolder(project.handle, 'README.md', content);
      // Reflect the write into the in-memory snapshot (the app would otherwise
      // show the stale README until reload).
      onSaved(content);
      setSaveStatus({ ok: true, message: 'Saved to the project folder.' });
    } catch (e) {
      setSaveStatus({
        ok: false,
        message: `Failed to write README: ${e instanceof Error ? e.message : 'unknown error'}`,
      });
    }
  };

  const save = async (content: string) => {
    // Confirm before overwriting an existing README (the handle write has no
    // OS dialog to prompt on its own).
    if (project && findReadme(project)) {
      setPendingSave({ content });
      return;
    }
    await writeToFolder(content);
  };

  const confirmOverwrite = () => {
    if (pendingSave) {
      void writeToFolder(pendingSave.content);
      setPendingSave(null);
    }
  };

  const cancelOverwrite = () => setPendingSave(null);

  const clearStatus = () => setSaveStatus(null);

  const reset = () => {
    setSaveStatus(null);
    setPendingSave(null);
  };

  return {
    saveStatus,
    pendingSave,
    save,
    confirmOverwrite,
    cancelOverwrite,
    clearStatus,
    reset,
  };
}
