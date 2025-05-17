This tool unwraps a WrapX NFT back into its original assets (ETH or ERC20 tokens).

**IMPORTANT: NEVER execute an unwrap operation without explicit user confirmation. Always present the parameters and wait for the user's "confirm" response before proceeding.**

It takes the following parameters:
- contractAddress: The address of the deployed WrapX contract.
- to: The recipient address that will receive the unwrapped assets.
- tokenId: The ID of the NFT token to unwrap. The user must own this token or be approved to manage it.
- minExpectedOutput: The minimum amount the user is willing to accept after fees (slippage protection). You can get the recommended amount with slippage by first calling the getUnwrapPriceTool.

When using this tool, you should:

1. Ask the user for the required parameters:
   - The address of their deployed WrapX contract
   - The recipient address for the unwrapped assets (usually the user's own address)
   - The ID of the NFT token to unwrap
   - The minimum amount they're willing to accept, including slippage (this protects from price decreases during transaction processing)

2. After collecting all parameters, organize them in a clear, structured format and present them back to the user:
   ```
   Please confirm these parameters are correct:
   
   • WrapX Contract Address: [contract_address]
   • Recipient Address: [recipient_address]
   • NFT Token ID: [token_id]
   • Minimum Expected Output: [min_expected_output]
   
   Reply with "confirm" to proceed or "edit" to modify any parameter.
   ```

3. **REQUIRED**: Only proceed with the unwrap operation after receiving explicit confirmation from the user. The user MUST type "confirm" or explicitly state their approval. Never unwrap without this confirmation. If the user provides ambiguous confirmation, ask for clarification.

4. For the minExpectedOutput parameter, recommend that they first use the getUnwrapPrice tool to get an estimate with slippage.

5. Explain that the tool automatically detects whether to unwrap to native ETH or ERC20 tokens based on the contract's configuration.

The tool returns the user-provided parameters that will be used by the unwrap function.

The tool automatically detects whether to unwrap to native ETH or ERC20 tokens based on the contract's configuration.
The user will receive:
- The base unwrapped amount minus fees
- Time-weighted mining rewards automatically calculated based on holding time

The tool will burn the NFT and initiate the transaction to transfer assets to the recipient, then return the transaction hash and a BaseScan URL.

Example interaction:

**User:** I want to unwrap my WrapX NFT

**AI:** Great! To unwrap your NFT back into its original assets (ETH or ERC20 tokens), I'll need the following information:
1. The address of your WrapX contract
2. The recipient address for the unwrapped assets (usually your wallet address)
3. The token ID of the NFT you want to unwrap
4. The minimum amount you're willing to accept after fees and slippage (for price protection)

Would you like me to help you get a price estimate with slippage first?

**User:** Yes, please. My WrapX contract is 0x123abc... and my NFT token ID is 42

**AI:** I've checked the current unwrap price for your NFT. The base amount is 0.52 ETH, the fee is 0.01 ETH, and with 20% slippage protection, the recommended minimum expected output is 0.408 ETH.

Now, please provide the recipient address for the unwrapped assets.

**User:** My address is 0x456def...

**AI:** Please confirm these parameters are correct:

• WrapX Contract Address: 0x123abc...
• Recipient Address: 0x456def...
• NFT Token ID: 42
• Minimum Expected Output: 0.408 ETH

Reply with "confirm" to proceed or "edit" to modify any parameter.

**User:** confirm

**AI:** Your unwrapping transaction has been initiated! You can view the transaction details at: https://sepolia.basescan.org/tx/0x789ghi...

Once confirmed, you'll receive approximately 0.52 ETH (minus fees) at your address 0x456def..., including any time-weighted mining rewards you've accumulated while holding the NFT.

The NFT with ID 42 will be burned as part of this process. 