// Browser persistence layer: localStorage for project + conversation, IndexedDB
// for the directory handle. Each store is a folder owning its persistence and
// the logic that feeds it. Domain types live in @/lib (imported for types only).
export {
  saveProject,
  loadProject,
  clearProject,
  readProject,
  readDroppedEntries,
} from './project';
export {
  saveConversation,
  loadConversation,
  clearConversation,
} from './conversation';
export {
  saveDirectory,
  loadDirectory,
  clearDirectory,
  pickDirectory,
  readDirectoryProject,
  writeFileToDirectory,
  ensurePermission,
} from './directory';
