// Dropped folders arrive as directory *entries*, not files. `dataTransfer.files`
// can't read them — we must walk the entry tree with the webkitGetAsEntry API.

type FileSystemEntryLike = {
  isFile: boolean;
  isDirectory: boolean;
  fullPath: string;
  file?: (cb: (file: File) => void, err: (e: unknown) => void) => void;
  createReader?: () => {
    readEntries: (
      cb: (entries: FileSystemEntryLike[]) => void,
      err: (e: unknown) => void,
    ) => void;
  };
};

function readEntryFile(entry: FileSystemEntryLike): Promise<File> {
  return new Promise((resolve, reject) => {
    entry.file?.((file) => {
      // Preserve the folder-relative path so it matches the input upload shape.
      Object.defineProperty(file, 'webkitRelativePath', {
        value: entry.fullPath.replace(/^\//, ''),
      });
      resolve(file);
    }, reject);
  });
}

function readAllDirEntries(
  entry: FileSystemEntryLike,
): Promise<FileSystemEntryLike[]> {
  const reader = entry.createReader!();
  const all: FileSystemEntryLike[] = [];
  return new Promise((resolve, reject) => {
    const next = () => {
      reader.readEntries((batch) => {
        // readEntries returns in chunks; an empty batch means we're done.
        if (batch.length === 0) return resolve(all);
        all.push(...batch);
        next();
      }, reject);
    };
    next();
  });
}

async function walk(entry: FileSystemEntryLike): Promise<File[]> {
  if (entry.isFile) return [await readEntryFile(entry)];
  if (entry.isDirectory) {
    const entries = await readAllDirEntries(entry);
    const nested = await Promise.all(entries.map(walk));
    return nested.flat();
  }
  return [];
}

/** Flatten a drop event's items (files or folders) into a list of Files. */
export async function readDroppedEntries(
  dataTransfer: DataTransfer,
): Promise<File[]> {
  const entries = Array.from(dataTransfer.items)
    .map((item) => item.webkitGetAsEntry?.() as FileSystemEntryLike | null)
    .filter((e): e is FileSystemEntryLike => e != null);

  const files = await Promise.all(entries.map(walk));
  return files.flat();
}
