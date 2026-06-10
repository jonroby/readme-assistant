
// Minimal typing for the File System Access API (not in lib.dom yet on all TS
// versions). Present in Chromium browsers; feature-detected before use.
type SaveFilePicker = (options?: {
  suggestedName?: string;
  types?: { description: string; accept: Record<string, string[]> }[];
}) => Promise<{
  createWritable: () => Promise<{
    write: (data: string) => Promise<void>;
    close: () => Promise<void>;
  }>;
}>;

/**
 * Writes the README to disk. MUST be called synchronously from a user gesture
 * (e.g. a button onClick) — showSaveFilePicker throws SecurityError otherwise.
 * This is why the agent loop only STAGES the content (see runWriteReadme); the
 * actual write happens here, on a click. Returns a status string; never throws.
 */
export async function saveReadmeToDisk(content: string): Promise<string> {
  const picker = (
    window as unknown as { showSaveFilePicker?: SaveFilePicker }
  ).showSaveFilePicker;

  // Browsers without the File System Access API (Firefox/Safari): fall back to
  // a plain download so the user still gets the file on disk.
  if (!picker) {
    downloadFallback(content);
    return 'Saved via browser download (README.md).';
  }

  try {
    const handle = await picker({
      suggestedName: 'README.md',
      types: [{ description: 'Markdown', accept: { 'text/markdown': ['.md'] } }],
    });
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
    return 'README written to disk successfully.';
  } catch (e) {
    // AbortError = user cancelled the save dialog; report it as a non-error.
    if (e instanceof DOMException && e.name === 'AbortError') {
      return 'The user cancelled the save dialog.';
    }
    return `Failed to write README: ${e instanceof Error ? e.message : 'unknown error'}`;
  }
}

/**
 * Client-side runner for the writeReadme tool. The disk write itself needs a
 * user gesture, which a streaming tool callback does not have — so this only
 * STAGES the content and reports back. The UI then shows a "Save to disk"
 * button whose click performs the real write via saveReadmeToDisk.
 */
export function runWriteReadme(): string {
  return 'README is ready. Tell the user to click "Save to disk" to write it.';
}

function downloadFallback(content: string): void {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'README.md';
  a.click();
  URL.revokeObjectURL(url);
}
