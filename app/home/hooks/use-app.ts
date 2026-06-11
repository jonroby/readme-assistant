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
  const chat = useChatSession(project.project);
  const saver = useReadmeSaver(project.project);
  // The file open in the viewer (app-level view state; cleared on teardown).
  const [openFile, setOpenFile] = useState<string | null>(null);
  const view = { openFile, setOpenFile };

  // Tear down every concern at once: project + handle, chat, saves, viewer.
  const clear = () => {
    project.clear();
    chat.reset();
    saver.reset();
    setOpenFile(null);
  };

  // Grouped by concern so the seams stay visible at the call site, rather than
  // flattened into one prop bag that reads like a single mixed blob.
  return { project, chat, saver, view, clear };
}
