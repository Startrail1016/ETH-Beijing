import { base, baseSepolia } from 'viem/chains';
import { chainIdToChain } from '../../chains.js';
export function constructBaseScanUrl(chain, transactionHash) {
    if (chain.id === base.id) {
        return `https://basescan.org/tx/${transactionHash}`;
    }
    if (chain.id === baseSepolia.id) {
        return `https://sepolia.basescan.org/tx/${transactionHash}`;
    }
}
export const checkToolSupportsChain = ({ chainId, supportedChains, }) => {
    if (supportedChains.some((chain) => chain.id === chainId)) {
        return true;
    }
    const chainName = chainId
        ? (chainIdToChain(chainId)?.name ?? `chain ${chainId}`)
        : 'chain';
    throw new Error(`Not implemented on ${chainName}`);
};
