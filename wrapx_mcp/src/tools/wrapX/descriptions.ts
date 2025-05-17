// Markdown descriptions for WrapX tools
import { readFileSync } from 'fs';
import { join } from 'path';

// Get the directory name of the current module
const __dirname = new URL('.', import.meta.url).pathname;

// Read markdown files
export const wrapToolDescription = readFileSync(
  join(__dirname, 'prompts/wrapTool.md'),
  'utf-8'
);

export const wrapNativeToolDescription = readFileSync(
  join(__dirname, 'prompts/wrapNativeTool.md'),
  'utf-8'
);

export const wrapTokenToolDescription = readFileSync(
  join(__dirname, 'prompts/wrapTokenTool.md'),
  'utf-8'
);

export const getWrapPriceToolDescription = readFileSync(
  join(__dirname, 'prompts/getWrapPriceTool.md'),
  'utf-8'
);

export const getStrategyToolDescription = readFileSync(
  join(__dirname, 'prompts/getStrategyTool.md'),
  'utf-8'
);

export const unwrapToolDescription = readFileSync(
  join(__dirname, 'prompts/unwrapTool.md'),
  'utf-8'
);

export const getUnwrapPriceToolDescription = readFileSync(
  join(__dirname, 'prompts/getUnwrapPriceTool.md'),
  'utf-8'
);
