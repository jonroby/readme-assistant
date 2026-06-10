export type ProjectFile = { path: string; content: string };
export type Project = { files: ProjectFile[]; totalBytes: number };

export const MAX_PROJECT_BYTES = 1024 * 1024; // 1 MB
const STORAGE_KEY = 'project';

/**
 * OS/tooling artifacts to drop from an upload. This is NOT content filtering —
 * the user still owns what real files they include. These are noise the user
 * can't even see (e.g. .DS_Store is hidden in Finder) or never means to share.
 */
export function isNoise(path: string): boolean {
  const segments = path.split('/');
  return segments.some(
    (s) =>
      s === '.DS_Store' ||
      s === 'Thumbs.db' ||
      s === '.git' ||
      s === 'node_modules',
  );
}

/**
 * Read every selected file as text and enforce the total-size cap.
 * No filtering — the whole selection counts toward the limit.
 * Throws if the total exceeds MAX_PROJECT_BYTES.
 */
export async function readProject(files: File[]): Promise<Project> {
  let totalBytes = 0;
  const result: ProjectFile[] = [];

  for (const file of files) {
    const path = file.webkitRelativePath || file.name;
    if (isNoise(path)) continue;

    totalBytes += file.size;
    if (totalBytes > MAX_PROJECT_BYTES) {
      throw new Error(
        `Project is too large (over ${formatBytes(MAX_PROJECT_BYTES)}). Remove files and try again.`,
      );
    }
    result.push({
      // webkitRelativePath gives the in-folder path; fall back to the name.
      path,
      content: await file.text(),
    });
  }

  return { files: result, totalBytes };
}

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

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
