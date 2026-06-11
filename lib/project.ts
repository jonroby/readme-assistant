export type ProjectFile = { path: string; content: string };
export type Project = {
  name: string;
  files: ProjectFile[];
  totalBytes: number;
};

export const MAX_PROJECT_BYTES = 1024 * 1024; // 1 MB

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

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
