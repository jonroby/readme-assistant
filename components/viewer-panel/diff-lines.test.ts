import { describe, it, expect } from 'vitest';
import { toDiffLines } from './diff-lines';

describe('toDiffLines', () => {
  it('marks every line as context when nothing changed', () => {
    expect(toDiffLines('a\nb\n', 'a\nb\n')).toEqual([
      { kind: 'context', text: 'a' },
      { kind: 'context', text: 'b' },
    ]);
  });

  it('does not emit a blank trailing row from a trailing newline', () => {
    const lines = toDiffLines('a\n', 'a\n');
    expect(lines).toEqual([{ kind: 'context', text: 'a' }]);
  });

  it('tags added and removed lines', () => {
    const lines = toDiffLines('a\nb\n', 'a\nc\n');
    expect(lines).toContainEqual({ kind: 'remove', text: 'b' });
    expect(lines).toContainEqual({ kind: 'add', text: 'c' });
    expect(lines).toContainEqual({ kind: 'context', text: 'a' });
  });

  it('treats an empty base as all additions', () => {
    expect(toDiffLines('', 'x\ny\n')).toEqual([
      { kind: 'add', text: 'x' },
      { kind: 'add', text: 'y' },
    ]);
  });

  it('treats an emptied draft as all removals', () => {
    expect(toDiffLines('x\ny\n', '')).toEqual([
      { kind: 'remove', text: 'x' },
      { kind: 'remove', text: 'y' },
    ]);
  });
});
