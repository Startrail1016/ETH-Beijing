This tool wraps a specified amount of native ETH into a WrapX NFT.

**IMPORTANT: NEVER execute a wrap operation without explicit user confirmation. Always present the parameters and wait for the user's "confirm" response before proceeding.**

It takes the following parameters:
- contractAddress: The address of the deployed WrapX (Token) contract.
- to: The recipient address for the new NFT.
- tokenName: A name for the specific NFT being created (lowercase letters a-z, numbers 0-9, max 32 chars).
- amount: The maximum amount of tokens (in the token's smallest unit) the user is willing to pay, including slippage.
- 
When using this tool, you should:

1. Ask the user for the required parameters:
   - The address of their deployed WrapX contract that supports native ETH
   - The recipient address for the new NFT (usually the user's own address)
   - A unique name for this specific NFT (must be lowercase letters a-z, numbers 0-9, max 32 chars)
   - The maximum amount of ETH you're willing to pay, including slippage (this protects you from price increases during transaction processing)

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

6. Make sure the user has enough ETH to cover both the wrap amount and gas fees.

Example interaction:

**User:** I want to execute a wrap

**AI:** Great! To wrap native ETH into a WrapX NFT, I'll need the following information:
1. The address of your deployed WrapX contract
2. The recipient address for the new NFT (usually your wallet address)
3. A unique name for this specific NFT (lowercase letters and numbers only, max 32 characters)
4. The maximum amount of ETH you're willing to pay, including slippage (this protects you from price increases during transaction processing)

Would you like me to help you get a price estimate with slippage first?

**User:** Yes, please get a price estimate. WrapX address is 0x123abc...

**AI:** I've checked the current wrap price for your contract. The base amount is 0.5 ETH, the fee is 0.01 ETH, and with 20% slippage, the recommended total amount is 0.612 ETH. 

Now, please provide the recipient address and a unique name for your NFT.

**User:** Recipient: 0x456def... Name: ethwrap1

**AI:** Please confirm these parameters are correct:

• WrapX Contract Address: 0x123abc...
• Recipient Address: 0x456def...
• NFT Name: ethwrap1
• Wrap Amount: 0.612 ETH

Reply with "confirm" to proceed or "edit" to modify any parameter.

**User:** confirm

**AI:** Your native ETH wrapping transaction has been initiated! You can view the transaction details at: https://sepolia.basescan.org/tx/0x789ghi...

Once confirmed, you'll receive an NFT named "ethwrap1" representing your wrapped ETH.

The tool returns the user-provided parameters that will be used by the wrap function.

The tool will initiate the transaction and return the transaction hash and a BaseScan URL. 