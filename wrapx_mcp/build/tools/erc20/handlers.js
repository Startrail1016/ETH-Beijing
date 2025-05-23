import { erc20Abi, formatUnits, isAddress, parseUnits, } from 'viem';
import { base } from 'viem/chains';
import { constructBaseScanUrl } from '../utils/index.js';
export async function erc20BalanceHandler(wallet, args) {
    const { contractAddress } = args;
    if (!isAddress(contractAddress, { strict: false })) {
        throw new Error(`Invalid contract address: ${contractAddress}`);
    }
    const balance = await wallet.readContract({
        address: contractAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [wallet.account?.address ?? '0x'],
    });
    const decimals = await wallet.readContract({
        address: contractAddress,
        abi: erc20Abi,
        functionName: 'decimals',
    });
    return formatUnits(balance, decimals);
}
export async function erc20TransferHandler(wallet, args) {
    const { contractAddress, toAddress, amount } = args;
    if (!isAddress(contractAddress, { strict: false })) {
        throw new Error(`Invalid contract address: ${contractAddress}`);
    }
    if (!isAddress(toAddress, { strict: false })) {
        throw new Error(`Invalid to address: ${toAddress}`);
    }
    // Get decimals for token
    const decimals = await wallet.readContract({
        address: contractAddress,
        abi: erc20Abi,
        functionName: 'decimals',
    });
    // Format units
    const atomicUnits = parseUnits(amount, decimals);
    const tx = await wallet.simulateContract({
        address: contractAddress,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [toAddress, atomicUnits],
        account: wallet.account,
        chain: wallet.chain,
    });
    const txHash = await wallet.writeContract(tx.request);
    return JSON.stringify({
        hash: txHash,
        url: constructBaseScanUrl(wallet.chain ?? base, txHash),
    });
}
