import { encodeFunctionData, erc20Abi, formatUnits, } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { base } from 'viem/chains';
import { USDC_ADDRESS, USDC_DECIMALS } from '../../lib/constants.js';
import { COINBASE_COMMERCE_ABI } from '../../lib/contracts/coinbase-commerce.js';
import { checkToolSupportsChain, constructBaseScanUrl, } from '../utils/index.js';
export async function buyOpenRouterCreditsHandler(wallet, args) {
    const { amountUsd } = args;
    checkToolSupportsChain({
        chainId: wallet.chain?.id,
        supportedChains: [base],
    });
    if (!process.env.OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY is not set');
    }
    const address = wallet.account?.address;
    if (!address) {
        throw new Error('No address found');
    }
    // Ensure user has enough USDC for txn
    const usdcBalance = await wallet.readContract({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address],
    });
    const parsedUnits = formatUnits(usdcBalance, USDC_DECIMALS);
    if (Number(parsedUnits) < amountUsd) {
        throw new Error('Insufficient USDC balance');
    }
    const response = await fetch('https://openrouter.ai/api/v1/credits/coinbase', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            amount: amountUsd,
            sender: address,
            chain_id: base.id, // only Base supported
        }),
    });
    const responseJSON = await response.json();
    const { data: { web3_data: { transfer_intent: { call_data }, }, }, } = responseJSON;
    console.error(responseJSON);
    // Generate transactions based off intent
    const atomicUnits = BigInt(call_data.recipient_amount) + BigInt(call_data.fee_amount);
    const approvalTxCalldata = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [
            responseJSON.data.web3_data.transfer_intent.metadata
                .contract_address,
            atomicUnits,
        ],
    });
    const transferTokenPreApprovedTxCalldata = encodeFunctionData({
        abi: COINBASE_COMMERCE_ABI,
        functionName: 'transferTokenPreApproved',
        args: [
            {
                id: call_data.id,
                deadline: BigInt(Math.floor(new Date(call_data.deadline).getTime() / 1000)),
                recipient: call_data.recipient,
                recipientAmount: BigInt(call_data.recipient_amount),
                recipientCurrency: call_data.recipient_currency,
                refundDestination: call_data.refund_destination,
                feeAmount: BigInt(call_data.fee_amount),
                operator: call_data.operator,
                signature: call_data.signature,
                prefix: call_data.prefix,
            },
        ],
    });
    const approval = await wallet.sendTransaction({
        to: USDC_ADDRESS,
        data: approvalTxCalldata,
        account: wallet.account,
        chain: wallet.chain,
    });
    await waitForTransactionReceipt(wallet, {
        hash: approval,
    });
    const transfer = await wallet.sendTransaction({
        to: responseJSON.data.web3_data.transfer_intent.metadata
            .contract_address,
        data: transferTokenPreApprovedTxCalldata,
        account: wallet.account,
        chain: wallet.chain,
    });
    const { transactionHash } = await waitForTransactionReceipt(wallet, {
        hash: transfer,
    });
    return JSON.stringify({
        hash: transactionHash,
        url: constructBaseScanUrl(wallet.chain ?? base, transactionHash),
    });
}
