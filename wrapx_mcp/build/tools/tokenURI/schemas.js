import { z } from 'zod';
export const SetTokenURIEngineSchema = z.object({
    contractAddress: z.string()
        .describe('The address of the deployed WrapX contract.'),
    tokenId: z.string()
        .regex(/^[0-9]+$/, "Token ID must be a number")
        .describe('The ID of the NFT token to set the URI engine for.'),
    tokenURIEngine: z.string()
        .describe('The address of the token URI engine to set.'),
});
