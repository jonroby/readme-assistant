'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { applyReadmeToProject, SAVED_README_PATH } from '@/lib/project';
import type { ChatPanelHandle } from '@/components/chat-panel';
import { useProject } from './use-project';
import { useReadmeSaver } from './use-readme-saver';

/**
 * The app's whole state. Composes the project and README-saver hooks, owns the
 * viewer state, and coordinates the save workflow. The chat/LLM concern lives
 * in its own <ChatPanel> component (so streaming re-renders stay contained);
 * the app reaches into it only for two imperative actions — appending a save
 * a user-action message and resetting on teardown — via `chatRef`.
 */
export function useApp() {
  const project = useProject();

  // Imperative handle to the chat component. Used only for out-of-band actions
  // (inject a save message; reset the conversation) — not data flow.
  const chatRef = useRef<ChatPanelHandle>(null);

  // The viewer's content (app-level view state; cleared on teardown). It holds
  // EITHER a real project file (by path) OR a staged README draft — never both,
  // since there is a single viewer pane. Opening one clears the other.
  const [openFile, setOpenFileState] = useState<string | null>(null);
  const [draft, setDraft] = useState<string | null>(null);

  // A successful save: record it in the chat timeline, fold the written README
  // into the in-memory snapshot (so the tree/findReadme stop being stale
  // without a reload), then swap the viewer from the draft to the now-real
  // README.md file — it's no longer a draft, so it loses the "(draft)" label
  // and the Save control.
  const handleSaved = (content: string) => {
    // Phrased as a fact the model can act on next turn (it now knows the README
    // on disk is current and shouldn't re-prompt the user to save).
    chatRef.current?.addCustomMessage('Saved the README to disk as README.md.');
    if (project.project) {
      project.updateProject(applyReadmeToProject(project.project, content));
    }
    setDraft(null);
    setOpenFileState(SAVED_README_PATH);
  };

  const saver = useReadmeSaver(project.project, handleSaved);

  const setOpenFile = (path: string | null) => {
    setDraft(null);
    setOpenFileState(path);
  };

  // Show a proposed README in the viewer. Called when proposeReadme stages a
  // draft, so the user reads it in the panel instead of a wall of chat text.
  // Stable identity (only stable setters inside) so the chat callback that
  // calls it never goes stale. The save-status reset that used to live here now
  // happens in the effect below, keyed off `draft`.
  const openDraft = useCallback((content: string) => {
    setOpenFileState(null);
    setDraft(content);
  }, []);

  // A freshly opened draft starts clean: clear any prior "Saved ✓" so the new
  // draft's Save button isn't showing the previous draft's result.
  useEffect(() => {
    if (draft !== null) saver.clearStatus();
    // saver.clearStatus is a stable setter wrapper; we intentionally key only
    // on `draft` so this fires when a new draft opens, not on save-state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const closeViewer = () => {
    setOpenFileState(null);
    setDraft(null);
  };

  const view = { openFile, draft, setOpenFile, openDraft, closeViewer };

  // Tear down every concern at once: project + handle, chat, saves, viewer.
  const clear = () => {
    project.clear();
    chatRef.current?.reset();
    saver.reset();
    closeViewer();
  };

  // Grouped by concern so the seams stay visible at the call site, rather than
  // flattened into one prop bag that reads like a single mixed blob. `chatRef`
  // is wired onto <ChatPanel> by the consumer.
  return { project, chatRef, saver, view, clear };
}
