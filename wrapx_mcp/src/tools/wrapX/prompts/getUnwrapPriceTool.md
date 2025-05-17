This tool queries the current unwrap price from the oracle and returns the recommended unwrap amount with slippage.

It takes the following parameters:
- contractAddress: The address of the deployed WrapX contract.
- tokenId: The ID of the NFT token to get unwrap price for.
- slippagePercent: (Optional) The slippage percentage to subtract (default: 20%).

When using this tool, you should:

1. Ask the user for the required parameters:
   - The address of their deployed WrapX contract
   - The ID of the NFT token they want to unwrap
   - Optionally, the slippage percentage they want to use (if different from the default 20%)

2. Explain to the user that this tool helps them get a price estimate before unwrapping, and includes:
   - The base amount
   - The fee amount
   - The minimum expected output with slippage (recommended for the unwrap transaction)

3. After getting the price, suggest that they proceed with the unwrap transaction using the recommended minimum expected output.

The tool will return:
- Base amount: The original amount without fees
- Fee: The fee that will be deducted
- Recommended minimum expected output: Base amount minus fees and minus slippage buffer

Example interaction:

**User:** I want to check the price for unwrapping my NFT

**AI:** I'd be happy to help you get a price estimate for unwrapping your NFT. Please provide the address of your WrapX contract and the token ID of the NFT you want to unwrap. Would you like to use the default slippage protection of 20%, or specify a different percentage?

**User:** My contract address is 0x123abc... and my NFT token ID is 42. I'd like to use 10% slippage.

**AI:** I've checked the current unwrap price for your NFT with 10% slippage protection. Here's the estimate:

- Base amount: 0.52 ETH
- Fee amount: 0.01 ETH
- Minimum expected output with 10% slippage: 0.459 ETH

This is the recommended minimum expected output to use when initiating an unwrap transaction to protect against price changes. Would you like to proceed with unwrapping using this estimate?

**User:** Yes, let's unwrap the NFT

**AI:** Great! To proceed with the unwrap transaction, I'll need to confirm the recipient address for the unwrapped assets...

This is useful for getting an estimate before initiating an unwrap transaction to protect against price changes. 