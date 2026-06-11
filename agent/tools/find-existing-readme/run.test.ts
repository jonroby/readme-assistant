import { describe, it, expect } from 'vitest';
import { runFindExistingReadme } from './run';
import type { Project } from '@/lib/project';

describe('runFindExistingReadme', () => {
  it('returns the existing README path and contents', () => {
    const project: Project = {
      name: 'demo',
      totalBytes: 0,
      files: [
        { path: 'README.md', content: '# Hello' },
        { path: 'src/index.ts', content: '' },
      ],
    };
    const out = runFindExistingReadme(project);
    expect(out).toContain('README.md');
    expect(out).toContain('# Hello');
  });

  it('matches any casing/extension', () => {
    const project: Project = {
      name: 'demo',
      totalBytes: 0,
      files: [{ path: 'readme.txt', content: 'hi' }],
    };
    expect(runFindExistingReadme(project)).toContain('readme.txt');
  });

  it('reports when there is no README', () => {
    const project: Project = {
      name: 'demo',
      totalBytes: 0,
      files: [{ path: 'src/index.ts', content: '' }],
    };
    expect(runFindExistingReadme(project)).toBe(
      'No existing README found in the project.',
    );
  });

  it('handles a null project', () => {
    expect(runFindExistingReadme(null)).toBe('No project loaded.');
  });
});
