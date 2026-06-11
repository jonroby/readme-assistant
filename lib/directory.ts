// Minimal typing for the File System Access API — not in every TS lib.dom yet.
// The DirectoryHandle type is app-wide (used by the storage layer and the page);
// the operations that pick/read/write a directory live in @/storage/directory.

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

/** True if the File System Access directory API is available (Chromium only). */
export function supportsDirectoryAccess(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}
