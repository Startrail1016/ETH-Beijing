// Markdown descriptions for TokenURI tools
import { readFileSync } from 'fs';
import { join } from 'path';

// Get the directory name of the current module
const __dirname = new URL('.', import.meta.url).pathname;

// Read markdown files
export const setTokenURIEngineToolDescription = readFileSync(
  join(__dirname, 'prompts/setTokenURIEngineTool.md'),
  'utf-8'
);
