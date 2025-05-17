import { isAddress } from 'viem';
import type { PublicActions, WalletClient } from 'viem';
import { base } from 'viem/chains';
import type { z } from 'zod';
import { constructBaseScanUrl } from '../utils/index.js';
import { ListNftsSchema, TransferNftSchema } from './schemas.js';
import { fetchNftsFromAlchemy, formatNftData, transferNft } from './utils.js';

export async function listNftsHandler(
  wallet: WalletClient & PublicActions,
  args: z.infer<typeof ListNftsSchema>,
): Promise<string> {
  try {
    // Validate owner address
    if (!isAddress(args.ownerAddress)) {
      throw new Error(`Invalid owner address: ${args.ownerAddress}`);
    }

    // Fetch NFTs from Alchemy API
    const nftData = await fetchNftsFromAlchemy({
      ownerAddress: args.ownerAddress,
      limit: args.limit,
    });

    // Format the NFT data
    const nfts = formatNftData({
      nftData,
    });

    // Format the result
    if (nfts.length === 0) {
      return 'No NFTs found for this address.';
    }

    const formattedNfts = nfts
      .map((nft, index) => {
        return `${index + 1}. ${nft.title} (${nft.tokenType})
  Contract: ${nft.contractAddress}
  Token ID: ${nft.tokenId}
  ${nft.imageUrl ? `Image: ${nft.imageUrl}` : ''}`;
      })
      .join('\n\n');

    return `Found ${nfts.length} NFTs:\n\n${formattedNfts}`;
  } catch (error) {
    console.error('Error listing NFTs:', error);
    return `Error listing NFTs: ${error instanceof Error ? error.message : String(error)}`;
  }
}

export async function transferNftHandler(
  wallet: WalletClient & PublicActions,
  args: z.infer<typeof TransferNftSchema>,
): Promise<string> {
  try {
    // Validate addresses
    if (!isAddress(args.contractAddress)) {
      throw new Error(`Invalid contract address: ${args.contractAddress}`);
    }

    if (!isAddress(args.toAddress)) {
      throw new Error(`Invalid recipient address: ${args.toAddress}`);
    }

    // Execute the transfer
    const txHash = await transferNft({
      wallet,
      contractAddress: args.contractAddress,
      tokenId: args.tokenId,
      toAddress: args.toAddress,
      amount: args.amount,
    });

    // Construct transaction URL
    const txUrl = constructBaseScanUrl(wallet.chain ?? base, txHash);

    return `NFT transfer initiated!\n\nTransaction: ${txUrl}\n\nPlease wait for the transaction to be confirmed.`;
  } catch (error) {
    console.error('Error transferring NFT:', error);
    return `Error transferring NFT: ${error instanceof Error ? error.message : String(error)}`;
  }
}
