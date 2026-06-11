import { describe, it, expect } from 'vitest';
import { runAgent, toolSequence, countTool } from './harness';
import { nodeLib, projectWithReadme } from './fixtures';

/**
 * Trajectory evals for the README agent. These call the real model (OpenAI),
 * so they cost tokens and are NON-deterministic — run them with `npm run eval`,
 * not in the default `npm test`. They assert on the agent's BEHAVIOR (which
 * tools it calls, in what order, how it ends), not on exact README wording.
 *
 * A flaky eval is information, not a failure to suppress: if a run trips an
 * assertion intermittently, that's the model's real failure rate on that step.
 */

const TIMEOUT_MS = 60_000;

describe('README agent — trajectory', () => {
  it(
    'discovers and reads files before proposing, and proposes exactly once',
    async () => {
      const run = await runAgent(nodeLib, 'Please generate a README for this project.');

      // Every runner resolved cleanly — no tool threw (a thrown runner would
      // be silently absorbed by the model, leaving the trajectory looking ok).
      expect(run.toolErrors).toEqual([]);

      // It should explore before writing — at least one discovery/read call.
      expect(toolSequence(run)).toContain('listFiles');
      expect(
        countTool(run, 'readFile') + countTool(run, 'searchFiles'),
      ).toBeGreaterThan(0);

      // It should produce exactly one staged draft, and proposeReadme should be
      // the LAST tool call — it shouldn't go read more files after staging.
      // (The model may still emit a one-line text note afterwards; that's a
      // step, not a tool call, so this stays the final tool call.)
      expect(countTool(run, 'proposeReadme')).toBe(1);
      expect(toolSequence(run).at(-1)).toBe('proposeReadme');
      expect(run.proposedReadme).toBeTruthy();

      // It must stay within the production step cap.
      expect(run.stepCount).toBeLessThanOrEqual(6);
    },
    TIMEOUT_MS,
  );

  it(
    'grounds the README in the real package — names it, no invented deps',
    async () => {
      const run = await runAgent(nodeLib, 'Generate a README.');
      const readme = run.proposedReadme ?? '';

      // The real package name appears; a plausible-but-absent dep does not.
      expect(readme).toContain('string-utils');
      expect(readme.toLowerCase()).not.toContain('express');
    },
    TIMEOUT_MS,
  );

  it(
    'checks for an existing README before improving it',
    async () => {
      const run = await runAgent(
        projectWithReadme,
        'Improve the README for this project.',
      );

      // When a README exists, the model should look at it before proposing.
      const seq = toolSequence(run);
      expect(seq).toContain('findExistingReadme');
      const checkedAt = seq.indexOf('findExistingReadme');
      const proposedAt = seq.indexOf('proposeReadme');
      expect(checkedAt).toBeGreaterThanOrEqual(0);
      expect(proposedAt).toBeGreaterThan(checkedAt);
    },
    TIMEOUT_MS,
  );

  // Regression for a prod bug: "update the README into French" produced a prose
  // reply that CLAIMED to have staged the draft but never called proposeReadme,
  // so nothing appeared in the panel. An edit/translate request must stage.
  // Run a few times: the failure was intermittent, so one green run isn't proof
  // — we assert it stages on a strong majority and surface the rate.
  it(
    'stages a draft when asked to translate/update an existing README',
    async () => {
      // Sequential, not parallel: avoids 5 concurrent calls tripping a rate
      // limit. Transport errors (429/network) are excluded from the denominator
      // — only genuine model runs count, so an infra hiccup never reads as a
      // model miss.
      let attempts = 0;
      let staged = 0;
      for (let i = 0; i < 5; i++) {
        let run;
        try {
          run = await runAgent(projectWithReadme, 'Update the README into French.');
        } catch {
          continue; // transport failure — not a model miss, don't count it
        }
        attempts++;
        if (countTool(run, 'proposeReadme') >= 1) staged++;
      }

      // Need a few real runs to make the rate meaningful at all.
      expect(attempts, 'too many transport failures to judge').toBeGreaterThanOrEqual(3);
      // Surface the observed rate; flag below threshold as the model's real miss.
      const rate = `${staged}/${attempts}`;
      expect(
        staged / attempts,
        `proposeReadme called in ${rate} runs`,
      ).toBeGreaterThanOrEqual(0.8);
    },
    TIMEOUT_MS * 6,
  );

  // Inverse: a plain question is NOT a request to write docs. The model should
  // explore and answer in chat, and must NOT stage a draft (over-proposing is
  // its own failure — it would pop a save panel the user didn't ask for).
  it(
    'answers a question without proposing a README',
    async () => {
      const run = await runAgent(nodeLib, 'What does this project do?');

      expect(countTool(run, 'proposeReadme')).toBe(0);
      // It still grounds the answer in the files rather than guessing.
      expect(
        countTool(run, 'listFiles') +
          countTool(run, 'readFile') +
          countTool(run, 'searchFiles'),
      ).toBeGreaterThan(0);
    },
    TIMEOUT_MS,
  );
});
