import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
    // Evals call the real model (tokens, non-deterministic). They live in
    // evals/*.eval.ts and run via `npm run eval`, never in the default `npm test`.
    exclude: ['**/node_modules/**', 'evals/**'],
  },
});
