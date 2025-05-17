import { generateTool } from '../../utils.js';
import { deployWrapXHandler } from './handlers.js';
import { DeployWrapXSchema } from './schemas.js';
import { deployWrapXToolDescription } from './descriptions.js';
// Tool for deploying WrapX in a single step
export const deployWrapXTool = generateTool({
    name: 'WrapXDeployerActionProvider_deploy_wrapx',
    description: deployWrapXToolDescription,
    inputSchema: DeployWrapXSchema,
    toolHandler: deployWrapXHandler,
});
export default { deployWrapXTool };
