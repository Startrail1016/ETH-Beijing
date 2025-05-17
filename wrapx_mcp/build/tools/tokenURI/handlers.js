import { isAddress } from 'viem';
import { base } from 'viem/chains';
import { constructBaseScanUrl } from '../utils/index.js';
import { TOKENURI_ENGINE_ABI } from './abi.js';
export async function setTokenURIEngineHandler(wallet, args) {
    // Validate contract address
    if (!isAddress(args.contractAddress)) {
        throw new Error(`Invalid contract address: ${args.contractAddress}`);
    }
    // Validate token URI engine address
    if (!isAddress(args.tokenURIEngine)) {
        throw new Error(`Invalid token URI engine address: ${args.tokenURIEngine}`);
    }
    try {
        // Simulate the contract call to check for errors
        const tx = await wallet.simulateContract({
            account: wallet.account,
            abi: TOKENURI_ENGINE_ABI,
            address: args.contractAddress,
            functionName: 'setTokenURIEngine',
            args: [
                BigInt(args.tokenId),
                args.tokenURIEngine,
            ],
        });
        // Execute the transaction
        const txHash = await wallet.writeContract(tx.request);
        return JSON.stringify({
            hash: txHash,
            url: constructBaseScanUrl(wallet.chain ?? base, txHash),
            message: `Successfully set token URI engine for NFT #${args.tokenId} to ${args.tokenURIEngine}.`,
        });
    }
    catch (error) {
        throw new Error(`Failed to set token URI engine: ${error}`);
    }
}
