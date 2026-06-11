'use client';

import { useState } from 'react';
import { useProject } from './use-project';
import { useChatSession } from './use-chat-session';
import { useReadmeSaver } from './use-readme-saver';

/**
 * The app's whole state. Composes the project, chat, and README-saver hooks —
 * which share one lifecycle: a project loads and they all spin up; `clear`
 * tears every concern down together, so no part can be left behind.
 */
export function useApp() {
  const project = useProject();
  const saver = useReadmeSaver(project.project);

  // The viewer's content (app-level view state; cleared on teardown). It holds
  // EITHER a real project file (by path) OR a staged README draft — never both,
  // since there is a single viewer pane. Opening one clears the other.
  const [openFile, setOpenFileState] = useState<string | null>(null);
  const [draft, setDraft] = useState<string | null>(null);

  const setOpenFile = (path: string | null) => {
    setDraft(null);
    setOpenFileState(path);
  };

  // Show a proposed README in the viewer. Called when proposeReadme stages a
  // draft, so the user reads it in the panel instead of a wall of chat text.
  // A fresh draft clears any prior save status (the Save button lives in the
  // viewer header alongside the draft).
  const openDraft = (content: string) => {
    saver.clearStatus();
    setOpenFileState(null);
    setDraft(content);
  };

  const closeViewer = () => {
    setOpenFileState(null);
    setDraft(null);
  };

  const view = { openFile, draft, setOpenFile, openDraft, closeViewer };

  const chat = useChatSession(project.project, openDraft);

  // Tear down every concern at once: project + handle, chat, saves, viewer.
  const clear = () => {
    project.clear();
    chat.reset();
    saver.reset();
    closeViewer();
  };

  // Grouped by concern so the seams stay visible at the call site, rather than
  // flattened into one prop bag that reads like a single mixed blob.
  return { project, chat, saver, view, clear };
}
