import { findExistingReadmeTool } from './find-existing-readme';
import { listFilesTool } from './list-files';
import { readFileTool } from './read-file';
import { searchFilesTool } from './search-files';
import { writeReadmeTool } from './write-readme';

/** The tool set passed to streamText. One entry per tool folder. */
export const tools = {
  findExistingReadme: findExistingReadmeTool,
  listFiles: listFilesTool,
  readFile: readFileTool,
  searchFiles: searchFilesTool,
  writeReadme: writeReadmeTool,
};

export { runFindExistingReadme } from './find-existing-readme';
export { runListFiles, type ListFilesInput } from './list-files';
export { runReadFile, type ReadFileInput } from './read-file';
export { runSearchFiles, type SearchFilesInput } from './search-files';
export {
  runWriteReadme,
  saveReadmeToDisk,
  type WriteReadmeInput,
} from './write-readme';
