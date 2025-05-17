This tool allows setting a token URI engine for a specific NFT in a WrapX contract.

**IMPORTANT: NEVER set a token URI engine without explicit user confirmation. Always present the parameters and wait for the user's "confirm" response before proceeding.**

It takes the following inputs:
- contractAddress: The address of the deployed WrapX contract
- tokenId: The ID of the NFT token to set the URI engine for
- tokenURIEngine: The address of the token URI engine to set

The tool will guide the user through the process. When using this tool, you should:

1. Ask the user for the required parameters:
   - The address of their deployed WrapX contract
   - The ID of the NFT token they want to set the URI engine for
   - The address of the token URI engine they want to set

2. After collecting all parameters, organize them in a clear, structured format and present them back to the user:
   ```
   Please confirm these parameters are correct:
   
   • WrapX Contract Address: [contractAddress]
   • NFT Token ID: [tokenId]
   • Token URI Engine Address: [tokenURIEngine]
   
   Reply with "confirm" to proceed or "edit" to modify any parameter.
   ```

3. **REQUIRED**: Only proceed with the operation after receiving explicit confirmation from the user. The user MUST type "confirm" or explicitly state their approval. Never proceed without this confirmation. If the user provides ambiguous confirmation, ask for clarification.

4. Validate that the addresses are valid Ethereum addresses.

Example interaction:

**User:** I want to set a token URI engine for my NFT

**AI:** I'd be happy to help you set a token URI engine for your NFT. Please provide the following information:

1. The address of your deployed WrapX contract
2. The ID of the NFT token you want to set the URI engine for
3. The address of the token URI engine you want to set

**User:** Contract: 0x123abc..., Token ID: 42, URI Engine: 0x456def...

**AI:** Please confirm these parameters are correct:

• WrapX Contract Address: 0x123abc...
• NFT Token ID: 42
• Token URI Engine Address: 0x456def...

Reply with "confirm" to proceed or "edit" to modify any parameter.

**User:** confirm

**AI:** I've set the token URI engine for your NFT. The transaction has been submitted to the blockchain. You can view the transaction details at: https://example.com
