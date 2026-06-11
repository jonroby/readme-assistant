// Minimal typing for the File System Access API — not in every TS lib.dom yet.
// A DirectoryHandle is a project's location (project.handle): the live, writable
// reference to the picked folder. The operations that pick/read/write it live in
// @/storage/project (access.ts).
export type PermissionState = 'granted' | 'denied' | 'prompt';
export type PermissionDescriptor = { mode?: 'read' | 'readwrite' };

export type DirectoryHandle = {
  kind: 'directory';
  name: string;
  entries: () => AsyncIterableIterator<[string, FileSystemHandleLike]>;
  getFileHandle: (
    name: string,
    options?: { create?: boolean },
  ) => Promise<FileHandle>;
  queryPermission: (d?: PermissionDescriptor) => Promise<PermissionState>;
  requestPermission: (d?: PermissionDescriptor) => Promise<PermissionState>;
};

type FileHandle = {
  kind: 'file';
  name: string;
  getFile: () => Promise<File>;
  createWritable: () => Promise<{
    write: (data: string) => Promise<void>;
    close: () => Promise<void>;
  }>;
};

type FileSystemHandleLike = DirectoryHandle | FileHandle;

export type ProjectFile = { path: string; content: string };
export type Project = {
  name: string;
  files: ProjectFile[];
  totalBytes: number;
  // The folder the project was loaded from — its location and write-back
  // target. A project always has one (folder-pick is the only load path).
  handle: DirectoryHandle;
};

export const MAX_PROJECT_BYTES = 2 * 1024 * 1024; // 2 MB

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

/** Whether a path names a root-level README (README.md, readme.txt, README…). */
export function isReadmePath(path: string): boolean {
  const segments = path.split('/');
  if (segments.length > 1) return false; // root-level only
  return /^readme(\.[^.]+)?$/i.test(segments[0]);
}

/**
 * Find the project's existing README, if any — the file a saved proposeReadme
 * draft would overwrite. Matches a root-level file named README (any extension/
 * casing — README.md, readme.txt, README). Returns the matched ProjectFile so
 * callers can read it or warn before overwriting.
 */
export function findReadme(project: Project): ProjectFile | undefined {
  return project.files.find((f) => isReadmePath(f.path));
}

/** The path we always write a saved README to (see writeFileToFolder usage). */
export const SAVED_README_PATH = 'README.md';

/**
 * Reflect a just-saved README into the in-memory project snapshot. We write to
 * disk as README.md, so this upserts a README.md entry with `content` and drops
 * any other README variant (e.g. a pre-existing lowercase readme.md), keeping
 * the snapshot and findReadme honest about what's now on disk. totalBytes is
 * recomputed from the new file set using UTF-8 byte length — an approximation
 * of the on-disk sizes readFolder records, close enough for the snapshot info.
 *
 * Risky by design: it mutates the loaded snapshot so the app doesn't need a
 * reload to see the saved README. The handle is carried through untouched.
 */
export function applyReadmeToProject(
  project: Project,
  content: string,
): Project {
  const files: ProjectFile[] = [
    ...project.files.filter((f) => !isReadmePath(f.path)),
    { path: SAVED_README_PATH, content },
  ];
  const encoder = new TextEncoder();
  const totalBytes = files.reduce(
    (sum, f) => sum + encoder.encode(f.content).length,
    0,
  );
  return { ...project, files, totalBytes };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
