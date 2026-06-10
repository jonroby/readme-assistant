import { findReadme, type Project } from '@/lib/project';

/**
 * Client-side runner for findExistingReadme. Reports whether the project has a
 * root README and, if so, returns its path and full contents so the model can
 * improve it. Never throws — returns a message string so the agent loop keeps
 * going.
 */
export function runFindExistingReadme(project: Project | null): string {
  if (!project) return 'No project loaded.';

  const readme = findReadme(project);
  if (!readme) return 'No existing README found in the project.';

  return `Existing README at ${readme.path}:\n\n${readme.content}`;
}
