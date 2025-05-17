This tool wraps a specified amount of ERC20 tokens into a WrapX NFT.

**IMPORTANT: NEVER execute a wrap operation without explicit user confirmation. Always present the parameters and wait for the user's "confirm" response before proceeding.**

It takes the following parameters:
- contractAddress: The address of the deployed WrapX (Token) contract.
- to: The recipient address for the new NFT.
- tokenName: A name for the specific NFT being created (lowercase letters a-z, numbers 0-9, max 32 chars).
- amount: The maximum amount of tokens (in the token's smallest unit) the user is willing to pay, including slippage.

When using this tool, you should:

1. Ask the user for the required parameters:
   - The address of their deployed WrapX contract that supports ERC20 tokens
   - The recipient address for the new NFT (usually the user's own address)
   - A unique name for this specific NFT (must be lowercase letters a-z, numbers 0-9, max 32 chars)
   - The maximum amount of tokens you're willing to pay, including slippage (this protects you from price increases during transaction processing)

2. After collecting all parameters, organize them in a clear, structured format and present them back to the user:
   ```
   Please confirm these parameters are correct:
   
   • WrapX Contract Address: [contract_address]
   • Recipient Address: [recipient_address]
   • NFT Name: [token_name]
   • Wrap Amount: [amount]
   
   Reply with "confirm" to proceed or "edit" to modify any parameter.
   ```

3. **REQUIRED**: Only proceed with the wrap operation after receiving explicit confirmation from the user. The user MUST type "confirm" or explicitly state their approval. Never wrap without this confirmation. If the user provides ambiguous confirmation, ask for clarification.

4. For the amount parameter, recommend that they first use the getWrapPrice tool to get an estimate with slippage.

5. Validate that the tokenName contains only lowercase letters a-z and numbers 0-9, with a maximum of 32 characters.

6. Explain that the tool will first perform an approval transaction for the ERC20 tokens, and then execute the wrap operation. Both transactions will require confirmation.

Example interaction:

**User:** I want to execute a wrap

**AI:** Great! To wrap ERC20 tokens into a WrapX NFT, I'll need the following information:
1. The address of your deployed WrapX contract
2. The recipient address for the new NFT (usually your wallet address)
3. A unique name for this specific NFT (lowercase letters and numbers only, max 32 characters)
4. The maximum amount of tokens you're willing to pay, including slippage (this protects you from price increases during transaction processing)

Would you like me to help you get a price estimate with slippage first?

**User:** Yes, please get a price estimate. WrapX address is 0x123abc...

**AI:** I've checked the current wrap price for your contract. The base amount is 100 USDC, the fee is 2 USDC, and with 20% slippage, the recommended total amount is 122 USDC. 

Now, please provide the recipient address and a unique name for your NFT.

**User:** Recipient: 0x456def... Name: usdcwrap

**AI:** Please confirm these parameters are correct:

• WrapX Contract Address: 0x123abc...
• Recipient Address: 0x456def...
• NFT Name: usdcwrap
• Wrap Amount: 122 USDC

Reply with "confirm" to proceed or "edit" to modify any parameter.

**User:** confirm

**AI:** I'll now process your token wrapping in two steps:

1. First, I'm initiating an approval transaction to allow the WrapX contract to use your tokens. You can view this transaction at: https://sepolia.basescan.org/tx/0x789ghi...

2. Once the approval is confirmed, I'll initiate the wrap transaction. You can view this second transaction at: https://sepolia.basescan.org/tx/0xabc123...

When both transactions are confirmed, you'll receive an NFT named "usdcwrap" representing your wrapped tokens.

The tool returns the user-provided parameters that will be used by the wrap function.

The tool will first approve the token transfer, then perform the wrap operation.
It will return the transaction hashes and BaseScan URLs for both operations. 