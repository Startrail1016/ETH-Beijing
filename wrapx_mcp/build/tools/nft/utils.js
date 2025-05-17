import { erc721Abi as viem_erc721Abi } from 'viem';
import { erc1155Abi } from '../../lib/contracts/erc1155.js';
// Extend viem's ERC721 ABI with supportsInterface function
const erc721Abi = [
    ...viem_erc721Abi,
    {
        inputs: [{ internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' }],
        name: 'supportsInterface',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
];
/**
 * Format NFT data from Alchemy API into a more usable format
 * @param nftData The raw NFT data from Alchemy API
 * @returns Formatted NFT data
 */
export function formatNftData({ nftData, }) {
    if (!nftData || !nftData.ownedNfts || !Array.isArray(nftData.ownedNfts)) {
        return [];
    }
    const ownedNfts = nftData.ownedNfts;
    return ownedNfts.map((nft) => {
        return {
            contractAddress: nft.contract?.address || '',
            tokenId: nft.tokenId || nft.id?.tokenId || '',
            title: nft.title || nft.name || 'Unnamed NFT',
            description: nft.description || '',
            tokenType: nft.tokenType || 'UNKNOWN',
            imageUrl: nft.media?.[0]?.gateway || nft.media?.[0]?.raw || nft.image || '',
            metadata: nft.metadata || {},
        };
    });
}
/**
 * Detect if a contract is ERC721 or ERC1155 by checking if it supports the respective interface ID
 * @param wallet Viem wallet client with public actions
 * @param contractAddress The contract address to check
 * @returns The detected NFT standard or "UNKNOWN"
 */
export async function detectNftStandard(wallet, contractAddress) {
    try {
        // ERC721 interface ID: 0x80ac58cd
        const isErc721 = await wallet.readContract({
            address: contractAddress,
            abi: erc721Abi,
            functionName: 'supportsInterface',
            args: ['0x80ac58cd'],
        });
        if (isErc721) {
            return 'ERC721';
        }
        // ERC1155 interface ID: 0xd9b67a26
        const isErc1155 = await wallet.readContract({
            address: contractAddress,
            abi: erc1155Abi,
            functionName: 'supportsInterface',
            args: ['0xd9b67a26'],
        });
        if (isErc1155) {
            return 'ERC1155';
        }
        return 'UNKNOWN';
    }
    catch (error) {
        console.error(`Error detecting NFT standard for ${contractAddress}:`, error);
        return 'UNKNOWN';
    }
}
/**
 * Helper function to fetch NFTs from Alchemy API
 * @param ownerAddress The address to fetch NFTs for
 * @param limit Maximum number of NFTs to fetch
 * @returns The NFT data from Alchemy API
 */
export async function fetchNftsFromAlchemy({ ownerAddress, limit = 50, }) {
    // Access environment variables safely
    const apiKey = typeof process !== 'undefined' ? process.env.ALCHEMY_API_KEY : undefined;
    if (!apiKey) {
        throw new Error('ALCHEMY_API_KEY is not set in environment variables');
    }
    try {
        const baseUrl = 'https://base-mainnet.g.alchemy.com/nft/v3';
        const url = `${baseUrl}/${apiKey}/getNFTsForOwner?owner=${ownerAddress}&withMetadata=true&pageSize=${limit}`;
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Alchemy API error (${response.status}): ${errorText}`);
            throw new Error(`Alchemy API error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error(`Error fetching NFTs from Alchemy:`, error);
        throw error;
    }
}
/**
 * Transfer an NFT from one address to another
 * @param wallet Wallet client with public actions
 * @param contractAddress Address of the NFT contract
 * @param tokenId ID of the token to transfer
 * @param toAddress Address to transfer the NFT to
 * @param amount Amount of tokens to transfer (for ERC1155)
 * @returns Transaction hash
 */
export async function transferNft({ wallet, contractAddress, tokenId, toAddress, amount = '1', }) {
    try {
        // Detect the NFT standard
        const nftStandard = await detectNftStandard(wallet, contractAddress);
        if (nftStandard === 'UNKNOWN') {
            throw new Error(`Contract at ${contractAddress} does not implement a supported NFT standard`);
        }
        // Get the wallet address
        const [fromAddress] = await wallet.getAddresses();
        // Convert values to the correct format
        const tokenIdBigInt = BigInt(tokenId);
        const amountBigInt = BigInt(amount);
        let hash;
        if (nftStandard === 'ERC721') {
            // Transfer ERC721 NFT
            hash = await wallet.writeContract({
                address: contractAddress,
                abi: erc721Abi,
                functionName: 'safeTransferFrom',
                args: [fromAddress, toAddress, tokenIdBigInt],
                chain: null,
                account: fromAddress,
            });
        }
        else {
            // Transfer ERC1155 NFT
            hash = await wallet.writeContract({
                address: contractAddress,
                abi: erc1155Abi,
                functionName: 'safeTransferFrom',
                args: [fromAddress, toAddress, tokenIdBigInt, amountBigInt, '0x'],
                chain: null,
                account: fromAddress,
            });
        }
        // Ensure the hash is in the correct format
        if (!hash.startsWith('0x')) {
            throw new Error(`Invalid transaction hash format: ${hash}`);
        }
        return hash;
    }
    catch (error) {
        console.error(`Error transferring NFT ${tokenId} from contract ${contractAddress}:`, error);
        throw new Error(`Failed to transfer NFT: ${error instanceof Error ? error.message : String(error)}`);
    }
}
