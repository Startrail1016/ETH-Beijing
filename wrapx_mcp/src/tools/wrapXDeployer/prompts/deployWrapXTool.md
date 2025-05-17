This tool allows deploying a WrapX contract that can wrap ETH or ERC20 tokens into NFTs.

**IMPORTANT: NEVER deploy a WrapX contract without explicit user confirmation. Always present the parameters and wait for the user's "confirm" response before proceeding.**

It takes the following inputs:
- name: Collection name (must contain only lowercase letters a-z and numbers 0-9, max 32 characters)
- basePremium: Used for pricing wrap/unwrap operations
- tokenAddress: address(0) for ETH, otherwise ERC20 token address
- maxSupply: Limit on number of NFTs that can be minted (set to 0 for unlimited supply, which is the default)

The deployer will receive an NFT representing ownership of the deployed contract. 

The tool will guide the user through the deployment process. When using this tool, you should:

1. Ask the user for the required parameters:
   - What name they want for their WrapX collection (must be lowercase letters a-z, numbers 0-9, max 32 chars)
   - The base premium they want to set (in ETH or the token's denomination)
   - The token address they want to wrap (address(0) or 0x0000000000000000000000000000000000000000 for ETH, or a valid ERC20 token address)
   - The maximum supply limit (0 for unlimited, which is the default)

2. After collecting all parameters, organize them in a clear, structured format and present them back to the user:
   ```
   Please confirm these parameters are correct:
   
   • Collection Name: [name]
   • Base Premium: [basePremium]
   • Token Address: [tokenAddress]
   • Maximum Supply: [maxSupply]
   
   Reply with "confirm" to proceed or "edit" to modify any parameter.
   ```

3. **REQUIRED**: Only proceed with the deployment operation after receiving explicit confirmation from the user. The user MUST type "confirm" or explicitly state their approval. Never deploy without this confirmation. If the user provides ambiguous confirmation, ask for clarification.

4. Validate that the name contains only lowercase letters a-z and numbers 0-9, with a maximum of 32 characters.

5. Explain that the deployer will receive an NFT representing ownership of the deployed contract.

Example interaction:

**User:** I want to deploy a WrapX contract

**AI:** Please tell me the name you want for your WrapX collection, the initial base premium, the token address you want to support, and the maximum supply (0 for unlimited, which is the default). e.g.,  meme, 1 eth, 0x999abcd..., 1000

**User:** meme, 1 eth, 0x999abcd..., 1000

**AI:** Please confirm these parameters are correct:

• Collection Name: "meme"
• Base Premium: 1 ETH
• Token Address: 0x999abcd...
• Maximum Supply: 1000

Reply with "confirm" to proceed or "edit" to modify any parameter.

**User:** confirm

**AI:** Your WrapX contract has been successfully deployed! The transaction has been submitted to the blockchain. You can view the transaction details at: https://example.com


