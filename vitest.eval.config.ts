import { defineConfig } from 'vitest/config';

// Config for evals only: they call the real model, so they're slower and
// non-deterministic. Run with `npm run eval`. The key is read from .env.local
// (or .env, or the shell) by evals/setup.ts.
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
    include: ['evals/**/*.eval.ts'],
    // Loads .env.local so OPENAI_API_KEY is available without an inline var.
    setupFiles: ['evals/setup.ts'],
    // One model run can take a while; don't let vitest's default kill it.
    testTimeout: 60_000,
  },
});
