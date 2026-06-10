import { readFileTool } from './read-file';
import { writeReadmeTool } from './write-readme';

/** The tool set passed to streamText. One entry per tool folder. */
export const tools = {
  readFile: readFileTool,
  writeReadme: writeReadmeTool,
};

export { runReadFile, type ReadFileInput } from './read-file';
export {
  runWriteReadme,
  saveReadmeToDisk,
  type WriteReadmeInput,
} from './write-readme';
