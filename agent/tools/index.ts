import { findExistingReadmeTool } from './find-existing-readme';
import { listFilesTool } from './list-files';
import { readFileTool } from './read-file';
import { searchFilesTool } from './search-files';
import { proposeReadmeTool } from './propose-readme';

/** The tool set passed to streamText. One entry per tool folder. */
export const tools = {
  findExistingReadme: findExistingReadmeTool,
  listFiles: listFilesTool,
  readFile: readFileTool,
  searchFiles: searchFilesTool,
  proposeReadme: proposeReadmeTool,
};

export { runFindExistingReadme } from './find-existing-readme';
export { runListFiles, type ListFilesInput } from './list-files';
export { runReadFile, type ReadFileInput } from './read-file';
export { runSearchFiles, type SearchFilesInput } from './search-files';
export {
  runProposeReadme,
  saveReadmeToDisk,
  type ProposeReadmeInput,
} from './propose-readme';
export { resolveToolCall, type ToolName, type ToolInputs } from './resolve';
