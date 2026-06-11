import { describe, it, expect } from 'vitest';
import {
  applyReadmeToProject,
  findReadme,
  isReadmePath,
  SAVED_README_PATH,
} from './project';
import { makeProject } from './project.fixture';

describe('isReadmePath', () => {
  it('matches root-level README variants regardless of casing/extension', () => {
    expect(isReadmePath('README.md')).toBe(true);
    expect(isReadmePath('readme.txt')).toBe(true);
    expect(isReadmePath('README')).toBe(true);
  });

  it('rejects non-root and non-README files', () => {
    expect(isReadmePath('docs/README.md')).toBe(false);
    expect(isReadmePath('src/index.ts')).toBe(false);
    expect(isReadmePath('READMENOT.md')).toBe(false);
  });
});

describe('applyReadmeToProject', () => {
  it('adds a README.md when the project has none', () => {
    const project = makeProject({
      name: 'demo',
      totalBytes: 0,
      files: [{ path: 'src/index.ts', content: 'hi' }],
    });

    const next = applyReadmeToProject(project, '# Hello');

    expect(findReadme(next)).toEqual({
      path: SAVED_README_PATH,
      content: '# Hello',
    });
    // The original file is preserved.
    expect(next.files.find((f) => f.path === 'src/index.ts')?.content).toBe(
      'hi',
    );
  });

  it('replaces an existing README and drops other README variants', () => {
    const project = makeProject({
      name: 'demo',
      totalBytes: 0,
      files: [
        { path: 'readme.md', content: 'old lowercase' },
        { path: 'src/index.ts', content: 'hi' },
      ],
    });

    const next = applyReadmeToProject(project, '# New');

    const readmes = next.files.filter((f) => isReadmePath(f.path));
    expect(readmes).toEqual([{ path: SAVED_README_PATH, content: '# New' }]);
  });

  it('recomputes totalBytes from UTF-8 content length', () => {
    const project = makeProject({
      name: 'demo',
      totalBytes: 999,
      files: [{ path: 'a.txt', content: 'ab' }],
    });

    // 'ab' (2 bytes) + 'é' (2 bytes in UTF-8) = 4.
    const next = applyReadmeToProject(project, 'é');

    expect(next.totalBytes).toBe(4);
  });

  it('carries the handle through untouched', () => {
    const project = makeProject({
      name: 'demo',
      totalBytes: 0,
      files: [],
    });

    const next = applyReadmeToProject(project, '# X');

    expect(next.handle).toBe(project.handle);
  });
});
