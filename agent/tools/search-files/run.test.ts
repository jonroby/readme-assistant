import { describe, it, expect } from 'vitest';
import { runSearchFiles } from './run';
import { makeProject } from '@/lib/project.fixture';

const project = makeProject({
  name: 'demo',
  totalBytes: 0,
  files: [
    { path: 'a.ts', content: 'const foo = 1;\nconst bar = 2;' },
    { path: 'b.ts', content: 'export function FOO() {}' },
    { path: 'c.ts', content: 'nothing here' },
  ],
});

describe('runSearchFiles', () => {
  it('finds matches across files with line numbers', () => {
    const out = runSearchFiles({ query: 'foo' }, project);
    expect(out).toContain('a.ts');
    expect(out).toContain('1: const foo = 1;');
    expect(out).toContain('b.ts');
  });

  it('is case-insensitive', () => {
    const out = runSearchFiles({ query: 'FOO' }, project);
    expect(out).toContain('a.ts');
    expect(out).toContain('b.ts');
  });

  it('respects a directory prefix', () => {
    const scoped = makeProject({
      name: 'demo',
      totalBytes: 0,
      files: [
        { path: 'src/a.ts', content: 'foo' },
        { path: 'lib/b.ts', content: 'foo' },
      ],
    });
    const out = runSearchFiles({ query: 'foo', prefix: 'src/' }, scoped);
    expect(out).toContain('src/a.ts');
    expect(out).not.toContain('lib/b.ts');
  });

  it('reports no matches', () => {
    expect(runSearchFiles({ query: 'zzz' }, project)).toBe(
      'No matches for "zzz".',
    );
  });

  it('rejects an empty query and a null project', () => {
    expect(runSearchFiles({ query: '   ' }, project)).toBe('Empty search query.');
    expect(runSearchFiles({ query: 'foo' }, null)).toBe('No project loaded.');
  });
});
