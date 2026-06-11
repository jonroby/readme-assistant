import { makeProject } from '@/lib/project.fixture';

/** A tiny Node library with a package.json and no existing README. */
export const nodeLib = makeProject({
  name: 'string-utils',
  totalBytes: 0,
  files: [
    {
      path: 'package.json',
      content: JSON.stringify(
        {
          name: 'string-utils',
          version: '1.2.0',
          description: 'Small string helpers',
          main: 'src/index.js',
          scripts: { test: 'vitest run' },
          dependencies: { lodash: '^4.17.21' },
        },
        null,
        2,
      ),
    },
    {
      path: 'src/index.js',
      content:
        "const { capitalize } = require('lodash');\n" +
        'function shout(s) { return capitalize(s) + "!"; }\n' +
        'module.exports = { shout };\n',
    },
    {
      path: 'src/index.test.js',
      content:
        "const { shout } = require('./index');\n" +
        "test('shout', () => { expect(shout('hi')).toBe('Hi!'); });\n",
    },
  ],
});

/** A project that already ships a README — exercises the improve-not-replace path. */
export const projectWithReadme = makeProject({
  name: 'cli-tool',
  totalBytes: 0,
  files: [
    {
      path: 'README.md',
      content: '# cli-tool\n\nA CLI. (docs are out of date)\n',
    },
    {
      path: 'package.json',
      content: JSON.stringify(
        { name: 'cli-tool', version: '0.3.0', bin: { 'cli-tool': 'bin/cli.js' } },
        null,
        2,
      ),
    },
    {
      path: 'bin/cli.js',
      content: '#!/usr/bin/env node\nconsole.log("hello from cli-tool");\n',
    },
  ],
});
