import type { UIMessage } from 'ai';

const STORAGE_KEY = 'conversation';

/**
 * Persist the chat messages so the conversation survives a reload, alongside
 * the project (see ./project). Same save/load/clear shape.
 */
export function saveConversation(messages: UIMessage[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

export function loadConversation(): UIMessage[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as UIMessage[];
  } catch {
    return [];
  }
}

export function clearConversation(): void {
  localStorage.removeItem(STORAGE_KEY);
}
