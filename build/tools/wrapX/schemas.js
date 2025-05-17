import { z } from 'zod';
import { isAddress } from 'viem';
// Schema for wrapping either ETH or ERC20 tokens into a WrapX NFT
export const WrapXSchema = z.object({
    contractAddress: z.string().refine(isAddress, {
        message: 'Invalid contract address',
    }).describe('The address of the deployed WrapX contract.'),
    to: z.string().refine(isAddress, {
        message: 'Invalid recipient address',
    }).describe('The address that will receive the wrapped NFT.'),
    tokenName: z.string()
        .min(1, "Token name cannot be empty")
        .max(32, "Token name must be 32 characters or less")
        .regex(/^[a-z0-9]+$/, "Token name must contain only lowercase letters a-z and numbers 0-9")
        .describe('A name for the specific NFT being created that must be explicitly asked from and provided by the user (lowercase letters a-z, numbers 0-9, max 32 chars). This field is required and has no default value. Do not suggest or provide any default values - always ask the user directly.'),
    amount: z.string()
        .regex(/^[0-9]+$/, "Amount must be a positive integer string")
        .describe('The maximum amount the user is willing to pay, including slippage (in wei for ETH or in the token\'s smallest unit for ERC20). You can get the recommended amount with slippage by first calling the getWrapPriceTool to query the oracle price.'),
});
// Schema for getting recommended wrap price with slippage
export const GetWrapPriceSchema = z.object({
    contractAddress: z.string().refine(isAddress, {
        message: 'Invalid contract address',
    }).describe('The address of the deployed WrapX contract.'),
    slippagePercent: z.number()
        .min(0, "Slippage percentage must be non-negative")
        .default(20)
        .describe('The slippage percentage to add (e.g., 20 for 20% buffer). Default: 20%'),
});
// Schema for getting strategy information from a WrapX contract
export const GetStrategySchema = z.object({
    contractAddress: z.string().refine(isAddress, {
        message: 'Invalid contract address',
    }).describe('The address of the deployed WrapX contract.'),
});
// Schema for unwrapping a WrapX NFT back into its original assets
export const UnwrapSchema = z.object({
    contractAddress: z.string().refine(isAddress, {
        message: 'Invalid contract address',
    }).describe('The address of the deployed WrapX contract.'),
    to: z.string().refine(isAddress, {
        message: 'Invalid recipient address',
    }).describe('The address that will receive the unwrapped assets.'),
    tokenId: z.string()
        .regex(/^[0-9]+$/, "TokenId must be a positive integer string")
        .describe('The ID of the NFT token to unwrap. The user must own this token or be approved to manage it.'),
    minExpectedOutput: z.string()
        .regex(/^[0-9]+$/, "Minimum expected output must be a positive integer string")
        .describe('The minimum amount the user is willing to accept after fees (slippage protection). You can get the recommended amount with slippage by first calling the getUnwrapPriceTool.'),
});
// Schema for getting recommended unwrap price with slippage
export const GetUnwrapPriceSchema = z.object({
    contractAddress: z.string().refine(isAddress, {
        message: 'Invalid contract address',
    }).describe('The address of the deployed WrapX contract.'),
    tokenId: z.string()
        .regex(/^[0-9]+$/, "TokenId must be a positive integer string")
        .describe('The ID of the NFT token to get unwrap price for.'),
    slippagePercent: z.number()
        .min(0, "Slippage percentage must be non-negative")
        .default(20)
        .describe('The slippage percentage to subtract (e.g., 20 for 20% buffer). Default: 20%'),
});
