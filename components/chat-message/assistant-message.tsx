'use client';

import type { UIMessage } from 'ai';
import Markdown from 'react-markdown';
import { stripOuterFence } from '@/agent/strip-fence';
import { SaveReadmeButton } from './save-readme-button';
import { ToolActivity, type ToolPart } from './tool-activity';

type AssistantMessageProps = {
  message: UIMessage;
  // Save the README staged by this message. Present only when the parent can
  // perform the write (a project is loaded).
  onSaveReadme?: (content: string) => void;
  saveStatus?: string;
};

/**
 * An assistant message. Renders message.parts in their true chronological
 * order — tool-activity lines interleave with text exactly as they happened —
 * then the inline save button when this message staged a README.
 */
export function AssistantMessage({
  message,
  onSaveReadme,
  saveStatus,
}: AssistantMessageProps) {
  const stagedReadme = getStagedReadme(message);

  return (
    <div className="flex flex-col gap-2">
      {message.parts.map((part, i) => {
        if (part.type === 'text') {
          if (!part.text) return null;
          return (
            <div
              key={i}
              className="prose prose-sm dark:prose-invert min-w-0 max-w-full break-words text-foreground prose-pre:whitespace-pre-wrap"
            >
              <Markdown>{stripOuterFence(part.text)}</Markdown>
            </div>
          );
        }
        if (part.type.startsWith('tool-')) {
          return <ToolActivity key={i} part={part as ToolPart} />;
        }
        return null;
      })}
      {stagedReadme && onSaveReadme && (
        <SaveReadmeButton
          content={stagedReadme}
          onSave={onSaveReadme}
          status={saveStatus}
        />
      )}
    </div>
  );
}

/**
 * The README this message staged, if any: the content the model passed to
 * writeReadme, fence-stripped. The save button travels with this message.
 */
function getStagedReadme(message: UIMessage): string | null {
  const writeReadme = message.parts.find(
    (p) => p.type === 'tool-writeReadme',
  ) as { input?: { content?: string } } | undefined;
  return writeReadme?.input?.content
    ? stripOuterFence(writeReadme.input.content)
    : null;
}
