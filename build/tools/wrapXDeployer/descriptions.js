// Markdown descriptions for WrapX Deployer tools
import { readFileSync } from 'fs';
import { join } from 'path';
// Get the directory name of the current module
const __dirname = new URL('.', import.meta.url).pathname;
// Read markdown files
export const deployWrapXToolDescription = readFileSync(join(__dirname, 'prompts/deployWrapXTool.md'), 'utf-8');
