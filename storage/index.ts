// Browser persistence layer: localStorage for project data + conversation,
// IndexedDB for the project's folder handle (saveProject splits a Project
// across both; loadProject rejoins them). Each store is a folder owning its
// persistence and the logic that feeds it. Domain types live in @/lib.
export {
  saveProject,
  loadProject,
  clearProject,
  pickFolder,
  readFolder,
  writeFileToFolder,
  ensurePermission,
} from './project';
export {
  saveConversation,
  loadConversation,
  clearConversation,
} from './conversation';
