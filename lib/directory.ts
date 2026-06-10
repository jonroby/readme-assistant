import {
  MAX_PROJECT_BYTES,
  formatBytes,
  isNoise,
  type Project,
} from '@/lib/project';

// Minimal typing for the File System Access API — not in every TS lib.dom yet.
type PermissionState = 'granted' | 'denied' | 'prompt';
type PermissionDescriptor = { mode?: 'read' | 'readwrite' };

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

/** True if the File System Access directory API is available (Chromium only). */
export function supportsDirectoryAccess(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

/**
 * Prompt the user to pick a project folder. Returns a live, writable directory
 * handle — the thing we persist so we can read from and write back into the
 * same folder later. Must be called from a user gesture.
 */
export async function pickDirectory(): Promise<DirectoryHandle> {
  const picker = (
    window as unknown as {
      showDirectoryPicker: (o?: {
        mode?: 'read' | 'readwrite';
      }) => Promise<DirectoryHandle>;
    }
  ).showDirectoryPicker;
  return picker({ mode: 'readwrite' });
}

/**
 * Recursively read every file under a directory handle into the Project shape
 * the chat loop already uses. Same rules as the upload path: skip OS noise,
 * enforce the 1 MB cap, paths are relative to the picked folder.
 */
export async function readDirectoryProject(
  dir: DirectoryHandle,
): Promise<Project> {
  let totalBytes = 0;
  const files: Project['files'] = [];

  async function walk(handle: DirectoryHandle, prefix: string): Promise<void> {
    for await (const [name, child] of handle.entries()) {
      const path = prefix ? `${prefix}/${name}` : name;
      if (isNoise(path)) continue;

      if (child.kind === 'directory') {
        await walk(child, path);
      } else {
        const file = await child.getFile();
        totalBytes += file.size;
        if (totalBytes > MAX_PROJECT_BYTES) {
          throw new Error(
            `Project is too large (over ${formatBytes(MAX_PROJECT_BYTES)}). Pick a smaller folder.`,
          );
        }
        files.push({ path, content: await file.text() });
      }
    }
  }

  await walk(dir, '');
  return { files, totalBytes };
}

/** Write (creating or overwriting) a file directly into the project folder. */
export async function writeFileToDirectory(
  dir: DirectoryHandle,
  name: string,
  content: string,
): Promise<void> {
  const fileHandle = await dir.getFileHandle(name, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}

/**
 * Ensure we still have readwrite permission for a (possibly persisted) handle.
 * Handles restored from IndexedDB report 'prompt' and need a fresh grant, which
 * requires a user gesture — so call this from a click. Returns true if granted.
 */
export async function ensurePermission(dir: DirectoryHandle): Promise<boolean> {
  const opts: PermissionDescriptor = { mode: 'readwrite' };
  const queried = await dir.queryPermission(opts);
  console.log('[directory] queryPermission(readwrite) ->', queried);
  if (queried === 'granted') return true;
  const requested = await dir.requestPermission(opts);
  console.log('[directory] requestPermission(readwrite) ->', requested);
  return requested === 'granted';
}
