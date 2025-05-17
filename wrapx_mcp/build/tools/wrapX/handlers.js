import { base } from 'viem/chains';
import { stringToHex, erc20Abi } from 'viem';
import { constructBaseScanUrl } from '../utils/index.js';
import { WrapXNative, WrapXToken } from './abi.js';
// Address representing native ETH in contracts
const NATIVE_ETH_ADDRESS = '0x0000000000000000000000000000000000000000';
/**
 * Helper function to get oracle price information
 * @private - This is an internal helper function
 */
async function _getOraclePrice(wallet, contractAddress, slippagePercent = 20) {
    try {
        // For ETH wrapping, data should be an empty string
        const data = "";
        // Call getWrapOracle to get the base swap amount and fee
        const result = await wallet.readContract({
            address: contractAddress,
            abi: WrapXNative,
            functionName: 'getWrapOracle',
            args: [data],
        }); // Type assertion for the tuple response
        // Extract swap amount and fee
        const swap = result[0];
        const fee = result[1];
        // Calculate total base amount
        const baseAmount = swap + fee;
        // Add slippage buffer (e.g., 20%)
        const slippageBuffer = (baseAmount * BigInt(slippagePercent)) / BigInt(100);
        const totalWithSlippage = baseAmount + slippageBuffer;
        return {
            swap,
            fee,
            total: totalWithSlippage
        };
    }
    catch (error) {
        console.error('Error getting oracle price:', error);
        throw new Error(`Failed to get recommended wrap amount: ${error}`);
    }
}
/**
 * Helper function to get oracle unwrap price information
 * @private - This is an internal helper function
 */
async function _getUnwrapOraclePrice(wallet, contractAddress, tokenId, slippagePercent = 20) {
    try {
        // For unwrap, we encode the tokenId as data
        const data = stringToHex(tokenId);
        // Call getUnwrapOracle to get the base swap amount and fee
        const result = await wallet.readContract({
            address: contractAddress,
            abi: WrapXNative,
            functionName: 'getUnwrapOracle',
            args: [data],
        }); // Type assertion for the tuple response
        // Extract swap amount and fee
        const swap = result[0];
        const fee = result[1];
        // Calculate total base amount
        const baseAmount = swap - fee;
        // Subtract slippage buffer (e.g., 20%)
        const slippageBuffer = (baseAmount * BigInt(slippagePercent)) / BigInt(100);
        const totalWithSlippage = baseAmount - slippageBuffer;
        return {
            swap,
            fee,
            total: totalWithSlippage
        };
    }
    catch (error) {
        console.error('Error getting oracle unwrap price:', error);
        throw new Error(`Failed to get recommended unwrap amount: ${error}`);
    }
}
/**
 * Tool to get the recommended wrap amount with slippage from the oracle
 * Returns price information for wrapping ETH including recommended amount with slippage
 */
export async function getWrapPriceHandler(wallet, args) {
    const { contractAddress, slippagePercent } = args;
    try {
        const priceInfo = await _getOraclePrice(wallet, contractAddress, slippagePercent);
        // Convert all BigInt values to strings to avoid serialization errors
        const baseAmount = (priceInfo.swap + priceInfo.fee).toString();
        const swapAmount = priceInfo.swap.toString();
        const feeAmount = priceInfo.fee.toString();
        const totalAmount = priceInfo.total.toString();
        return JSON.stringify({
            success: true,
            data: {
                baseAmount: baseAmount,
                breakdown: {
                    swap: swapAmount,
                    fee: feeAmount,
                },
                recommendedAmount: totalAmount,
                slippagePercent: slippagePercent,
                message: `Base amount is ${baseAmount} wei (swap: ${swapAmount}, fee: ${feeAmount}). With ${slippagePercent}% slippage buffer, recommended amount is ${totalAmount} wei.`
            }
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return JSON.stringify({
            success: false,
            error: errorMessage
        });
    }
}
/**
 * Tool to get the recommended unwrap amount with slippage from the oracle
 * Returns price information for unwrapping including recommended minimum expected output with slippage
 */
export async function getUnwrapPriceHandler(wallet, args) {
    const { contractAddress, tokenId, slippagePercent } = args;
    try {
        const priceInfo = await _getUnwrapOraclePrice(wallet, contractAddress, tokenId, slippagePercent);
        // Convert all BigInt values to strings to avoid serialization errors
        const baseAmount = (priceInfo.swap - priceInfo.fee).toString();
        const swapAmount = priceInfo.swap.toString();
        const feeAmount = priceInfo.fee.toString();
        const minExpectedOutput = priceInfo.total.toString();
        return JSON.stringify({
            success: true,
            data: {
                baseAmount: baseAmount,
                breakdown: {
                    swap: swapAmount,
                    fee: feeAmount,
                },
                minExpectedOutput: minExpectedOutput,
                slippagePercent: slippagePercent,
                message: `Base amount is ${baseAmount} wei (swap: ${swapAmount}, fee: ${feeAmount}). With ${slippagePercent}% slippage buffer, minimum expected output is ${minExpectedOutput} wei.`
            }
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return JSON.stringify({
            success: false,
            error: errorMessage
        });
    }
}
/**
 * Tool to wrap native ETH into a WrapX NFT
 * Only handles wrapping of native ETH (not ERC20 tokens)
 */
export async function wrapXNativeHandler(wallet, args) {
    const { contractAddress, to, tokenName, amount } = args;
    // Validate tokenName format (for user feedback purposes only)
    const nameRegex = /^[a-z0-9]+$/;
    if (!nameRegex.test(tokenName)) {
        throw new Error('Invalid token name format. Name must contain only lowercase letters a-z and numbers 0-9.');
    }
    if (tokenName.length > 32) {
        throw new Error('Token name is too long. Maximum length is 32 characters.');
    }
    try {
        // For ETH wrapping, encode the token name to use as data
        const data = stringToHex(tokenName);
        const ethAmount = BigInt(amount);
        // Simulate the contract call
        const tx = await wallet.simulateContract({
            account: wallet.account,
            abi: WrapXNative,
            address: contractAddress,
            functionName: 'wrap',
            args: [to, data],
            value: ethAmount,
        });
        // Execute the transaction
        const txHash = await wallet.writeContract(tx.request);
        return JSON.stringify({
            hash: txHash,
            url: constructBaseScanUrl(wallet.chain ?? base, txHash),
            message: `Successfully initiated wrapping of ${amount} wei ETH into token '${tokenName}' for recipient ${to}.`,
        });
    }
    catch (error) {
        // Provide a more informative error message
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to wrap ETH: ${errorMessage}`);
    }
}
/**
 * Tool to wrap ERC20 tokens into a WrapX NFT
 * Only handles wrapping of ERC20 tokens (not native ETH)
 */
export async function wrapXTokenHandler(wallet, args) {
    const { contractAddress, to, tokenName, amount } = args;
    // Validate tokenName format (for user feedback purposes only)
    const nameRegex = /^[a-z0-9]+$/;
    if (!nameRegex.test(tokenName)) {
        throw new Error('Invalid token name format. Name must contain only lowercase letters a-z and numbers 0-9.');
    }
    if (tokenName.length > 32) {
        throw new Error('Token name is too long. Maximum length is 32 characters.');
    }
    try {
        // Get strategy to find the token address
        const strategyJson = await getStrategyHandler(wallet, { contractAddress });
        const strategy = JSON.parse(strategyJson);
        if (!strategy.success) {
            throw new Error(`Failed to get strategy: ${strategy.error}`);
        }
        const tokenAddress = strategy.data.asset.currency;
        if (tokenAddress === NATIVE_ETH_ADDRESS) {
            throw new Error('This contract is for wrapping native ETH, not ERC20 tokens. Use wrapXNativeHandler instead.');
        }
        // For token wrapping, encode the token name to use as data
        const data = stringToHex(tokenName);
        const tokenAmount = BigInt(amount);
        // First, we need to approve the WrapX contract to spend our tokens
        // Approve the exact amount needed
        const approveTx = await wallet.simulateContract({
            account: wallet.account,
            abi: erc20Abi,
            address: tokenAddress,
            functionName: 'approve',
            args: [contractAddress, tokenAmount],
        });
        // Execute the approval transaction
        const approveHash = await wallet.writeContract(approveTx.request);
        // Now wrap the tokens (no value needed for ERC20 wrapping)
        const wrapTx = await wallet.simulateContract({
            account: wallet.account,
            abi: WrapXToken,
            address: contractAddress,
            functionName: 'wrap',
            args: [to, data],
        });
        // Execute the wrap transaction
        const wrapHash = await wallet.writeContract(wrapTx.request);
        return JSON.stringify({
            hash: wrapHash,
            approveHash: approveHash,
            url: constructBaseScanUrl(wallet.chain ?? base, wrapHash),
            approveUrl: constructBaseScanUrl(wallet.chain ?? base, approveHash),
            message: `Successfully initiated wrapping of ${amount} tokens into '${tokenName}' for recipient ${to}. First approved (${approveHash}), then wrapped (${wrapHash}).`,
        });
    }
    catch (error) {
        // Provide a more informative error message
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to wrap token: ${errorMessage}`);
    }
}
/**
 * Tool to unwrap a WrapX NFT back into its original assets (ETH or ERC20 tokens)
 */
export async function unwrapHandler(wallet, args) {
    const { contractAddress, to, tokenId, minExpectedOutput } = args;
    try {
        // Encode the minExpectedOutput as bytes for the data parameter
        const data = stringToHex(minExpectedOutput);
        const tokenIdBigInt = BigInt(tokenId);
        // Get strategy to determine the currency type (for display purposes)
        const strategyJson = await getStrategyHandler(wallet, { contractAddress });
        const strategy = JSON.parse(strategyJson);
        if (!strategy.success) {
            throw new Error(`Failed to get strategy: ${strategy.error}`);
        }
        const currencyType = strategy.data.asset.currency === NATIVE_ETH_ADDRESS ? 'ETH' : 'ERC20 tokens';
        // Simulate the contract call
        const tx = await wallet.simulateContract({
            account: wallet.account,
            abi: WrapXNative, // Both native and token use the same unwrap interface
            address: contractAddress,
            functionName: 'unwrap',
            args: [to, tokenIdBigInt, data],
        });
        // Execute the transaction
        const txHash = await wallet.writeContract(tx.request);
        return JSON.stringify({
            hash: txHash,
            url: constructBaseScanUrl(wallet.chain ?? base, txHash),
            message: `Successfully initiated unwrapping of tokenId ${tokenId} into ${currencyType} for recipient ${to}. Minimum expected output: ${minExpectedOutput}.`,
        });
    }
    catch (error) {
        // Provide a more informative error message
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to unwrap NFT: ${errorMessage}`);
    }
}
/**
 * Main wrap handler that decides whether to use native ETH or token wrapping
 * based on the contract's strategy
 */
export async function wrapXHandler(wallet, args) {
    const { contractAddress } = args;
    try {
        // Get strategy to determine the currency type
        const strategyJson = await getStrategyHandler(wallet, { contractAddress });
        const strategy = JSON.parse(strategyJson);
        if (!strategy.success) {
            throw new Error(`Failed to get strategy: ${strategy.error}`);
        }
        const currencyAddress = strategy.data.asset.currency;
        // Choose the appropriate handler based on currency
        if (currencyAddress === NATIVE_ETH_ADDRESS) {
            return wrapXNativeHandler(wallet, args);
        }
        else {
            return wrapXTokenHandler(wallet, args);
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return JSON.stringify({
            success: false,
            error: errorMessage
        });
    }
}
/**
 * Tool to get the strategy information from a WrapX contract
 * Returns strategy details including app address, asset information, and attribute data
 */
export async function getStrategyHandler(wallet, args) {
    const { contractAddress } = args;
    try {
        // Call getStrategy function on the contract
        const result = await wallet.readContract({
            address: contractAddress,
            abi: WrapXNative,
            functionName: 'getStrategy',
            args: [],
        }); // Type assertion for the tuple response
        // Extract strategy information
        const appAddress = result[0];
        const asset = result[1];
        const attributeData = result[2];
        // Format asset information
        const assetInfo = {
            currency: asset.currency,
            basePremium: asset.basePremium.toString(),
            feeRecipient: asset.feeRecipient,
            mintFeePercent: asset.mintFeePercent,
            burnFeePercent: asset.burnFeePercent
        };
        return JSON.stringify({
            success: true,
            data: {
                app: appAddress,
                asset: assetInfo,
                attributeData: attributeData,
                message: `Strategy fetched successfully for contract ${contractAddress}`
            }
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return JSON.stringify({
            success: false,
            error: errorMessage
        });
    }
}
