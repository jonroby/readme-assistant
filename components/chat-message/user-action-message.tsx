'use client';

import type { UIMessage } from 'ai';

// User-action messages are identified by this id prefix. useChatSession stamps
// it onto the synthetic messages it injects (e.g. "Saved the README…") for
// events the user triggered via the UI; this renderer keys off it to draw them
// as chips instead of chat bubbles. Owned here, with the rendering it governs.
export const USER_ACTION_PREFIX = 'user-action-';

/**
 * The display text of a user-action message (e.g. "Saved README.md to disk"),
 * if this message is one. These are real user-role messages the model also
 * sees, but the UI renders them as chips — identified by the user-action- id
 * prefix (set in useChatSession.addCustomMessage). The text is the message's
 * first text part.
 */
export function getUserActionText(message: UIMessage): string | null {
  if (!message.id.startsWith(USER_ACTION_PREFIX)) return null;
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
export function UserActionMessage({ text }: { text: string }) {
  return (
    <span className="-mt-2 inline-flex w-fit items-center rounded-full border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
      📝 {text}
    </span>
  );
}
