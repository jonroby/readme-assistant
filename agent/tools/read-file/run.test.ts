import { describe, it, expect } from 'vitest';
import { runReadFile } from './run';
import { makeProject } from '@/lib/project.fixture';

const project = makeProject({
  name: 'demo',
  totalBytes: 0,
  files: [{ path: 'src/index.ts', content: 'hello world' }],
});

describe('runReadFile', () => {
  it('returns the file contents', () => {
    expect(runReadFile({ path: 'src/index.ts' }, project)).toBe('hello world');
  });

  it('reports a missing file instead of throwing', () => {
    expect(runReadFile({ path: 'nope.ts' }, project)).toBe(
      'File not found: nope.ts',
    );
  });

  it('handles a null project', () => {
    expect(runReadFile({ path: 'src/index.ts' }, null)).toBe(
      'File not found: src/index.ts',
    );
  });
});
