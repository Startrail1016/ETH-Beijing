import { callContractTool } from './contracts/index.js';
import { erc20BalanceTool, erc20TransferTool } from './erc20/index.js';
import { getMorphoVaultsTool } from './morpho/index.js';
import { listNftsTool, transferNftTool } from './nft/index.js';
import { getOnrampAssetsTool, onrampTool } from './onramp/index.js';
import { buyOpenRouterCreditsTool } from './open-router/index.js';
import { setTokenURIEngineTool } from './tokenURI/index.js';
import { deployWrapXTool } from './wrapXDeployer/index.js';
import { wrapXTool, wrapXNativeTool, wrapXTokenTool, getWrapPriceTool, getStrategyTool, unwrapTool, getUnwrapPriceTool } from './wrapX/index.js';
export const baseMcpTools = [
    getMorphoVaultsTool,
    callContractTool,
    getOnrampAssetsTool,
    onrampTool,
    erc20BalanceTool,
    erc20TransferTool,
    listNftsTool,
    transferNftTool,
    buyOpenRouterCreditsTool,
    deployWrapXTool,
    wrapXTool,
    wrapXNativeTool,
    wrapXTokenTool,
    getWrapPriceTool,
    getStrategyTool,
    unwrapTool,
    getUnwrapPriceTool,
    setTokenURIEngineTool
];
export const toolToHandler = baseMcpTools.reduce((acc, tool) => {
    acc[tool.definition.name] = tool.handler;
    return acc;
}, {});
