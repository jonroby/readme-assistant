import {
  MAX_PROJECT_BYTES,
  formatBytes,
  isNoise,
  type Project,
  type ProjectFile,
} from '@/lib/project';

/**
 * Read every selected file as text into a Project, enforcing the total-size
 * cap. Used for the upload (click) and drag-drop load paths. Throws if the
 * total exceeds MAX_PROJECT_BYTES.
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
