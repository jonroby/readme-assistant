'use client';

import type { UIMessage } from 'ai';

/**
 * The text of a history marker (e.g. "Saved README.md to disk"), if this
 * message is one. Markers are synthetic, UI-only timeline entries carrying a
 * single data-marker part (see useChatSession.addMarker).
 */
export function getMarkerText(message: UIMessage): string | null {
  const part = message.parts.find((p) => p.type === 'data-marker') as
    | { data?: { text?: string } }
    | undefined;
  return part?.data?.text ?? null;
}

/**
 * A left-aligned, muted timeline note — a little chip, distinct from a chat
 * bubble. w-fit keeps it hugging its text inside the message list's column.
 * -mt-2 pulls it from the list's gap-4 (16px) up to the gap-2 (8px) rhythm the
 * in-message tool-activity chips use, so all the chips space identically.
 */
export function MarkerMessage({ text }: { text: string }) {
  return (
    <span className="-mt-2 inline-flex w-fit items-center rounded-full border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
      {text}
    </span>
  );
}
