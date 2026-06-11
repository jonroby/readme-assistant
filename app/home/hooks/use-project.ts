'use client';

import { useEffect, useState } from 'react';
import type { Project } from '@/lib/project';
import type { DirectoryHandle } from '@/lib/directory';
import {
  clearDirectory,
  clearProject,
  ensurePermission,
  loadDirectory,
  loadProject,
  pickDirectory,
  readDirectoryProject,
  readProject,
  saveDirectory,
  saveProject,
} from '@/storage';

type UseProject = {
  project: Project | null;
  dirHandle: DirectoryHandle | null;
  error: string | null;
  /** Upload fallback (non-Chromium): read File[] into the project, no handle. */
  loadFromFiles: (files: File[]) => Promise<void>;
  /** Chromium: pick a folder, giving a writable handle for write-back. */
  pickFolder: () => Promise<void>;
  /** Clear project + handle from state and storage. */
  clear: () => void;
};

/**
 * Owns the loaded project and its directory handle: the three load paths, the
 * mount-time restore from storage, and persistence. The conversation is a
 * separate concern (see useChatSession).
 */
export function useProject(): UseProject {
  const [project, setProject] = useState<Project | null>(null);
  const [dirHandle, setDirHandle] = useState<DirectoryHandle | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Restore a previously loaded project from localStorage, and its directory
  // handle from IndexedDB (permission re-grant deferred to a user click).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-time restore from localStorage
    setProject(loadProject());
    loadDirectory().then((handle) => {
      if (handle) setDirHandle(handle);
    });
  }, []);

  const loadFromFiles = async (files: File[]) => {
    setError(null);
    try {
      const next = await readProject(files);
      saveProject(next);
      setProject(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to read project.');
    }
  };

  const pickFolder = async () => {
    setError(null);
    try {
      const handle = await pickDirectory();
      if (!(await ensurePermission(handle))) {
        setError('Permission to access the folder was denied.');
        return;
      }
      const next = await readDirectoryProject(handle);
      saveProject(next);
      await saveDirectory(handle);
      setProject(next);
      setDirHandle(handle);
    } catch (e) {
      // AbortError = user cancelled the folder picker; not an error.
      if (e instanceof DOMException && e.name === 'AbortError') return;
      setError(e instanceof Error ? e.message : 'Failed to read folder.');
    }
  };

  const clear = () => {
    clearProject();
    clearDirectory();
    setProject(null);
    setDirHandle(null);
  };

  return { project, dirHandle, error, loadFromFiles, pickFolder, clear };
}
