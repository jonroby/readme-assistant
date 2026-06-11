'use client';

export type ToolPart = {
  type: string;
  input?: { path?: string; prefix?: string; query?: string };
};

/** One-line "what the agent is doing" label for a tool-call part. */
function toolActivityLabel(part: ToolPart): string {
  switch (part.type) {
    case 'tool-writeReadme':
      return '✍️ Writing README…';
    case 'tool-findExistingReadme':
      return '🔍 Checking for an existing README…';
    case 'tool-listFiles':
      return `🗂️ Listing files${part.input?.prefix ? ` in ${part.input.prefix}` : ''}…`;
    case 'tool-searchFiles':
      return `🔎 Searching for "${part.input?.query ?? ''}"…`;
    case 'tool-readFile':
    default:
      return `📄 Reading ${part.input?.path ?? 'file'}…`;
  }
}

/** A single tool-call activity line in the message timeline. */
export function ToolActivity({ part }: { part: ToolPart }) {
  return (
    <span className="text-xs text-muted-foreground">
      {toolActivityLabel(part)}
    </span>
  );
}
