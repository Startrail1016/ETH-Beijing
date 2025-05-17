import { z } from 'zod';
export const DeployWrapXSchema = z.object({
    name: z.string()
        .min(1, "Name cannot be empty")
        .max(32, "Name must be 32 characters or less")
        .regex(/^[a-z0-9]+$/, "Name must contain only lowercase letters a-z and numbers 0-9")
        .describe('The name of the NFT collection (must contain only lowercase letters a-z and numbers 0-9, max 32 characters). Example: "myethwrapper"'),
    basePremium: z.string()
        .describe('The base premium used for pricing wrap/unwrap operations, in wei. Recommended value for testing: "1000000000000000" (0.001 ETH)'),
    maxSupply: z.string()
        .describe('The maximum supply (limit on number of NFTs that can be minted). Suggested range: 10-1000. Example: "100"'),
    tokenAddress: z.string()
        .describe('The token address (use "0x0000000000000000000000000000000000000000" for ETH, or provide an ERC20 token address)'),
});
