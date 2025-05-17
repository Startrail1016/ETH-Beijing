import { generateTool } from '../../utils.js';
import { wrapXHandler, wrapXNativeHandler, wrapXTokenHandler, getWrapPriceHandler, getStrategyHandler, unwrapHandler, getUnwrapPriceHandler } from './handlers.js';
import { WrapXSchema, GetWrapPriceSchema, GetStrategySchema, UnwrapSchema, GetUnwrapPriceSchema } from './schemas.js';
import { 
  wrapToolDescription, 
  wrapNativeToolDescription, 
  wrapTokenToolDescription, 
  getWrapPriceToolDescription, 
  getStrategyToolDescription,
  unwrapToolDescription,
  getUnwrapPriceToolDescription
} from './descriptions.js';

// Tool for wrapping assets (ETH or tokens) into a WrapX NFT
export const wrapXTool = generateTool({
  name: 'WrapXActionProvider_wrap',
  description: wrapToolDescription,
  inputSchema: WrapXSchema,
  toolHandler: wrapXHandler,
});

// Tool specifically for wrapping native ETH into a WrapX NFT
export const wrapXNativeTool = generateTool({
  name: 'WrapXActionProvider_wrap_native',
  description: wrapNativeToolDescription,
  inputSchema: WrapXSchema,
  toolHandler: wrapXNativeHandler,
});

// Tool specifically for wrapping ERC20 tokens into a WrapX NFT
export const wrapXTokenTool = generateTool({
  name: 'WrapXActionProvider_wrap_token',
  description: wrapTokenToolDescription,
  inputSchema: WrapXSchema,
  toolHandler: wrapXTokenHandler,
});

// Tool for getting recommended wrap price with slippage
export const getWrapPriceTool = generateTool({
  name: 'WrapXActionProvider_get_wrap_price',
  description: getWrapPriceToolDescription,
  inputSchema: GetWrapPriceSchema,
  toolHandler: getWrapPriceHandler,
});

// Tool for getting strategy information from a WrapX contract
export const getStrategyTool = generateTool({
  name: 'WrapXActionProvider_get_strategy',
  description: getStrategyToolDescription,
  inputSchema: GetStrategySchema,
  toolHandler: getStrategyHandler,
});

// Tool for unwrapping a WrapX NFT back into its original assets
export const unwrapTool = generateTool({
  name: 'WrapXActionProvider_unwrap',
  description: unwrapToolDescription,
  inputSchema: UnwrapSchema,
  toolHandler: unwrapHandler,
});

// Tool for getting recommended unwrap price with slippage
export const getUnwrapPriceTool = generateTool({
  name: 'WrapXActionProvider_get_unwrap_price',
  description: getUnwrapPriceToolDescription,
  inputSchema: GetUnwrapPriceSchema,
  toolHandler: getUnwrapPriceHandler,
});

export default { 
  wrapXTool, 
  wrapXNativeTool, 
  wrapXTokenTool, 
  getWrapPriceTool, 
  getStrategyTool,
  unwrapTool,
  getUnwrapPriceTool
}; 