export type ProjectFile = { path: string; content: string };
export type Project = {
  name: string;
  files: ProjectFile[];
  totalBytes: number;
};

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
  // Upload (click) and drag-drop give paths prefixed with the dropped folder
  // (e.g. "myproject/src/..."). Strip that shared top folder so paths are
  // relative to it — matching the directory-pick shape the rest of the app
  // expects — and use it as the project name.
  const name = commonTopFolder(files);
  const strip = name ? `${name}/` : '';

  for (const file of files) {
    const raw = file.webkitRelativePath || file.name;
    if (isNoise(raw)) continue;

    totalBytes += file.size;
    if (totalBytes > MAX_PROJECT_BYTES) {
      throw new Error(
        `Project is too large (over ${formatBytes(MAX_PROJECT_BYTES)}). Remove files and try again.`,
      );
    }
    result.push({
      path: raw.startsWith(strip) ? raw.slice(strip.length) : raw,
      content: await file.text(),
    });
  }

  return { name, files: result, totalBytes };
}

/**
 * The single top-level folder all files share via webkitRelativePath, or "" if
 * they don't share one (loose files, or a multi-item selection).
 */
function commonTopFolder(files: File[]): string {
  const first = files[0]?.webkitRelativePath;
  if (!first?.includes('/')) return '';
  const top = first.split('/')[0];
  return files.every((f) => f.webkitRelativePath.startsWith(`${top}/`))
    ? top
    : '';
}

/**
 * Find the project's existing README, if any — the file writeReadme would
 * overwrite. Matches a root-level file named README (any extension/casing —
 * README.md, readme.txt, README). Returns the matched ProjectFile so callers
 * can read it or warn before overwriting.
 */
export function findReadme(project: Project): ProjectFile | undefined {
  return project.files.find((f) => {
    const name = f.path.split('/').pop() ?? '';
    return /^readme(\.[^.]+)?$/i.test(name);
  });
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
