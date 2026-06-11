'use client';

import type { UIMessage } from 'ai';
import { MARKER_ID_PREFIX } from '@/app/home/hooks/use-chat-session';

/**
 * The display text of a history marker (e.g. "Saved README.md to disk"), if
 * this message is one. Markers are real messages the model also sees, but the
 * UI renders them as chips — identified by the marker- id prefix (set in
 * useChatSession.addMarker). The text is the message's first text part.
 */
export function getMarkerText(message: UIMessage): string | null {
  if (!message.id.startsWith(MARKER_ID_PREFIX)) return null;
  const part = message.parts.find((p) => p.type === 'text') as
    | { text?: string }
    | undefined;
  return part?.text ?? null;
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
      📝 {text}
    </span>
  );
}
