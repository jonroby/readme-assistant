import type { Project } from '@/lib/project';

// Project file contents persisted to localStorage, so a reload restores the
// project. The directory handle (for write-back) is persisted separately in
// IndexedDB — see ../directory.
const STORAGE_KEY = 'project';

export function saveProject(project: Project): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
}

export function loadProject(): Project | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Project;
  } catch {
    return null;
  }
}

export function clearProject(): void {
  localStorage.removeItem(STORAGE_KEY);
}
