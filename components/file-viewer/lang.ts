import { bundledLanguages } from 'shiki';

// File extension → Shiki language id. Most match the extension directly; the
// rest are common aliases. Anything unmapped or unsupported renders as plain
// text (see langFromPath's fallback).
const EXT_TO_LANG: Record<string, string> = {
  ts: 'typescript',
  tsx: 'tsx',
  js: 'javascript',
  jsx: 'jsx',
  mjs: 'javascript',
  cjs: 'javascript',
  json: 'json',
  md: 'markdown',
  mdx: 'mdx',
  css: 'css',
  scss: 'scss',
  html: 'html',
  py: 'python',
  rb: 'ruby',
  go: 'go',
  rs: 'rust',
  java: 'java',
  c: 'c',
  h: 'c',
  cpp: 'cpp',
  sh: 'shell',
  bash: 'shell',
  yml: 'yaml',
  yaml: 'yaml',
  toml: 'toml',
  sql: 'sql',
};

/**
 * Resolve a Shiki language id from a file path, or 'text' if the extension is
 * unknown or its language isn't bundled. 'text' renders without highlighting.
 */
export function langFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  const lang = EXT_TO_LANG[ext];
  return lang && lang in bundledLanguages ? lang : 'text';
}
