'use client';

import { useEffect, useState } from 'react';
import type { Project } from '@/lib/project';
import {
  clearProject,
  ensurePermission,
  loadProject,
  pickFolder as openFolderPicker,
  readFolder,
  saveProject,
} from '@/storage';

type UseProject = {
  project: Project | null;
  error: string | null;
  /** Pick a folder, giving a project with a writable handle for write-back. */
  pickFolder: () => Promise<void>;
  /** Clear the project from state and storage. */
  clear: () => void;
};

/**
 * Owns the loaded project — the folder pick, the mount-time restore from
 * storage, and persistence. The project carries its own folder handle
 * (project.handle), so location isn't tracked separately. The conversation is
 * a separate concern (see useChatSession).
 */
export function useProject(): UseProject {
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Restore a previously loaded project (localStorage data + the IndexedDB
  // handle, rejoined in loadProject). The handle reports 'prompt' until the
  // first save click re-grants write permission — read works from cached files.
  useEffect(() => {
    loadProject().then((restored) => {
      if (restored) setProject(restored);
    });
  }, []);

  const pickFolder = async () => {
    setError(null);
    try {
      const handle = await openFolderPicker();
      if (!(await ensurePermission(handle))) {
        setError('Permission to access the folder was denied.');
        return;
      }
      const next = await readFolder(handle);
      saveProject(next);
      setProject(next);
    } catch (e) {
      // AbortError = user cancelled the folder picker; not an error.
      if (e instanceof DOMException && e.name === 'AbortError') return;
      setError(e instanceof Error ? e.message : 'Failed to read folder.');
    }
  };

  const clear = () => {
    clearProject();
    setProject(null);
  };

  return { project, error, pickFolder, clear };
}
