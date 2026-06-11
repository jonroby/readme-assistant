import {
  MAX_PROJECT_BYTES,
  formatBytes,
  isNoise,
  type Project,
  type DirectoryHandle,
  type PermissionDescriptor,
} from '@/lib/project';

/**
 * Prompt the user to pick a project folder. Returns a live, writable handle —
 * the thing we persist so we can read from and write back into the same folder
 * later. Must be called from a user gesture.
 */
export async function pickFolder(): Promise<DirectoryHandle> {
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
 * Recursively read every file under a folder handle into the Project shape the
 * chat loop uses. Skips OS noise, enforces the 2 MB cap; paths are relative to
 * the picked folder.
 */
export async function readFolder(folder: DirectoryHandle): Promise<Project> {
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

  await walk(folder, '');
  // Reject an empty folder (nothing readable after the noise filter): there's
  // nothing for the assistant to work with, and it keeps "a loaded project has
  // files" true everywhere downstream.
  if (files.length === 0) {
    throw new Error(
      'That folder has no readable files. Pick a folder with project files.',
    );
  }
  // folder.name is the picked folder; paths are relative to it, so it isn't in
  // them — this is the authoritative project name. The handle is the project's
  // location and write-back target.
  return { name: folder.name, files, totalBytes, handle: folder };
}

/** Write (creating or overwriting) a file directly into the project folder. */
export async function writeFileToFolder(
  folder: DirectoryHandle,
  name: string,
  content: string,
): Promise<void> {
  const fileHandle = await folder.getFileHandle(name, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}

/**
 * Ensure we still have readwrite permission for a (possibly persisted) handle.
 * Handles restored from storage report 'prompt' and need a fresh grant, which
 * requires a user gesture — so call this from a click. Returns true if granted.
 */
export async function ensurePermission(
  folder: DirectoryHandle,
): Promise<boolean> {
  const opts: PermissionDescriptor = { mode: 'readwrite' };
  if ((await folder.queryPermission(opts)) === 'granted') return true;
  return (await folder.requestPermission(opts)) === 'granted';
}
