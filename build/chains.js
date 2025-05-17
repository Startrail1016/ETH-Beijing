import { base, baseSepolia } from 'viem/chains';
export const chainIdToChain = (chainId) => {
    if (String(chainId) === String(baseSepolia.id)) {
        return baseSepolia;
    }
    if (String(chainId) === String(base.id)) {
        return base;
    }
    return null;
};
export const chainIdToCdpNetworkId = {
    [baseSepolia.id]: 'base-sepolia',
    [base.id]: 'base-mainnet',
};
