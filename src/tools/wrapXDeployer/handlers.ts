import type { PublicActions, WalletClient } from 'viem';
import { isAddress } from 'viem';
import { base } from 'viem/chains';
import type { z } from 'zod';
import { constructBaseScanUrl } from '../utils/index.js';
import type { DeployWrapXSchema } from './schemas.js';
import { WRAPX_DEPLOYER_ABI } from './abi.js';

export async function deployWrapXHandler(
  wallet: WalletClient & PublicActions,
  args: z.infer<typeof DeployWrapXSchema>,
): Promise<string> {
  // Get the WrapXDeployer address from environment variable at runtime
  const deployerAddress = process.env.WRAPX_DEPLOYER_ADDRESS;
  
  // Check if the address is undefined or empty
  if (!deployerAddress) {
    throw new Error('WrapXDeployer address not configured. Please set the WRAPX_DEPLOYER_ADDRESS environment variable to a valid contract address.');
  }

  // Validate name format - only lowercase letters a-z and numbers 0-9
  const nameRegex = /^[a-z0-9]+$/;
  if (!nameRegex.test(args.name)) {
    throw new Error('Invalid name format. Name must contain only lowercase letters a-z and numbers 0-9.');
  }

  if (args.name.length > 32) {
    throw new Error('Name is too long. Maximum length is 32 characters.');
  }

  // Validate token address
  if (args.tokenAddress !== '0x0000000000000000000000000000000000000000' && !isAddress(args.tokenAddress)) {
    throw new Error(`Invalid token address: ${args.tokenAddress}`);
  }

  try {
    // Determine the amount of ETH to send with the transaction
    // For deployWrapX, we need to send a small amount of ETH (e.g., 0.01 ETH) since it's a payable function
    const paymentAmount = BigInt(10000000000000000); // 0.01 ETH in wei

    // Simulate the contract call to check for errors
    const tx = await wallet.simulateContract({
      account: wallet.account,
      abi: WRAPX_DEPLOYER_ABI,
      address: deployerAddress as `0x${string}`,
      functionName: 'deployWrapX',
      args: [
        args.name,
        BigInt(args.basePremium),
        BigInt(args.maxSupply),
        args.tokenAddress,
      ],
      value: paymentAmount, // Send ETH with the transaction
    });

    // Execute the transaction
    const txHash = await wallet.writeContract(tx.request);

    return JSON.stringify({
      hash: txHash,
      url: constructBaseScanUrl(wallet.chain ?? base, txHash),
      message: `Successfully deployed WrapX contract for ${args.name}. You will receive an NFT representing ownership of the deployed contract.`,
    });
  } catch (error) {
    throw new Error(`Failed to deploy WrapX contract: ${error}`);
  }
}

 