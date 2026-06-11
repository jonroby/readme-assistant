import { describe, it, expect } from 'vitest';
import { runListFiles } from './run';
import { makeProject } from '@/lib/project.fixture';

const project = makeProject({
  name: 'demo',
  totalBytes: 0,
  files: [
    { path: 'README.md', content: '' },
    { path: 'src/index.ts', content: '' },
    { path: 'src/util.ts', content: '' },
  ],
});

describe('runListFiles', () => {
  it('lists all paths when no prefix is given', () => {
    const out = runListFiles({}, project);
    expect(out).toContain('- README.md');
    expect(out).toContain('- src/index.ts');
    expect(out).toContain('- src/util.ts');
  });

  it('filters to a directory prefix', () => {
    const out = runListFiles({ prefix: 'src/' }, project);
    expect(out).toContain('- src/index.ts');
    expect(out).not.toContain('README.md');
  });

  it('reports when nothing matches a prefix', () => {
    expect(runListFiles({ prefix: 'app/' }, project)).toBe(
      'No files under "app/".',
    );
  });

  it('handles a null project', () => {
    expect(runListFiles({}, null)).toBe('No project loaded.');
  });

  it('caps the output and notes how many more there are', () => {
    const many = makeProject({
      name: 'big',
      totalBytes: 0,
      files: Array.from({ length: 305 }, (_, i) => ({
        path: `f${i}.ts`,
        content: '',
      })),
    });
    const out = runListFiles({}, many);
    expect(out).toContain('…and 5 more');
  });
});
