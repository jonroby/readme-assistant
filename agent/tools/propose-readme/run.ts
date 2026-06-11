/**
 * Client-side runner for the proposeReadme tool. The disk write itself needs a
 * user gesture, which a streaming tool callback does not have — so this only
 * STAGES the content and reports back. The UI then shows a "Save to disk"
 * button whose click performs the real write (see useReadmeSaver).
 */
export function runProposeReadme(): string {
  return 'README draft is ready. Tell the user to click "Save" to write it to disk.';
}
