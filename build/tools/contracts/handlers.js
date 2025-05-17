import { isAddress } from 'viem';
import { base } from 'viem/chains';
import { constructBaseScanUrl } from '../utils/index.js';
export async function callContractHandler(wallet, args) {
    let abi = args.abi;
    try {
        abi = JSON.parse(abi);
    }
    catch (error) {
        throw new Error(`Invalid ABI: ${error}`);
    }
    if (!isAddress(args.contractAddress, { strict: false })) {
        throw new Error(`Invalid contract address: ${args.contractAddress}`);
    }
    let functionAbi;
    try {
        functionAbi = abi.find((item) => 'name' in item && item.name === args.functionName);
    }
    catch (error) {
        throw new Error(`Invalid function name: ${args.functionName}. ${error}`);
    }
    if (functionAbi.stateMutability === 'view' ||
        functionAbi.stateMutability === 'pure') {
        const tx = await wallet.readContract({
            address: args.contractAddress,
            abi,
            functionName: args.functionName,
            args: args.functionArgs,
        });
        return String(tx);
    }
    const tx = await wallet.simulateContract({
        account: wallet.account,
        abi,
        address: args.contractAddress,
        functionName: args.functionName,
        value: BigInt(args.value ?? 0),
        args: args.functionArgs,
    });
    const txHash = await wallet.writeContract(tx.request);
    return JSON.stringify({
        hash: txHash,
        url: constructBaseScanUrl(wallet.chain ?? base, txHash),
    });
}
