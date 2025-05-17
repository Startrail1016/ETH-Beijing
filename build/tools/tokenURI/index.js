import { generateTool } from '../../utils.js';
import { setTokenURIEngineHandler } from './handlers.js';
import { SetTokenURIEngineSchema } from './schemas.js';
import { setTokenURIEngineToolDescription } from './descriptions.js';
// Tool for setting token URI engine for a specific NFT
export const setTokenURIEngineTool = generateTool({
    name: 'TokenURIActionProvider_set_token_uri_engine',
    description: setTokenURIEngineToolDescription,
    inputSchema: SetTokenURIEngineSchema,
    toolHandler: setTokenURIEngineHandler,
});
export default { setTokenURIEngineTool };
