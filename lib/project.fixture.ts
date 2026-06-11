import type { Project, DirectoryHandle } from './project';

// A throwaway handle for tests. The tool runners only read name/files, never
// touch the handle, so its methods are never called — this just satisfies the
// type without dragging the File System Access API into unit tests.
const stubHandle = {} as DirectoryHandle;

/** Build a Project for tests without spelling out the folder handle. */
export function makeProject(fields: Omit<Project, 'handle'>): Project {
  return { ...fields, handle: stubHandle };
}
