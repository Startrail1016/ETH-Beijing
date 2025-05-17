This tool retrieves the strategy information from a WrapX contract.

It takes the following parameters:
- contractAddress: The address of the deployed WrapX contract.

When using this tool, you should:

1. Ask the user for the required parameter:
   - The address of their deployed WrapX contract

2. Explain to the user that this tool will retrieve important configuration details about their WrapX contract, including:
   - The app address
   - Asset information (currency type, base premium, etc.)
   - Fee recipient and fee structure
   - Other attribute data

3. Present the retrieved information in a clear, organized format that helps the user understand their contract's configuration.

Example interaction:

**User:** I want to check the details of my WrapX contract

**AI:** I'd be happy to retrieve the strategy information for your WrapX contract. Please provide the address of your deployed WrapX contract.

**User:** My contract address is 0x123abc...

**AI:** I've retrieved the strategy information for your WrapX contract. Here are the details:

**Contract Configuration:**
- App address: 0xdef456...
- Asset type: Native ETH
- Base premium: 1 ETH
- Fee recipient: 0xghi789...
- Fee structure: 2% protocol fee

**Attributes:**
- Maximum supply: Unlimited (0)
- Current supply: 5 NFTs
- Contract name: meme3

This information shows how your WrapX contract is configured. Would you like to know more about any specific aspect of your contract?

**User:** How does the fee structure work?

**AI:** The fee structure for your WrapX contract works as follows:

When someone wraps ETH using your contract, they pay the base premium (1 ETH) plus a 2% protocol fee. This fee goes to the fee recipient address (0xghi789...).

The base premium can be adjusted by the contract owner if needed. The current setup means that each wrap operation will cost at minimum 1 ETH plus the protocol fee, plus any gas costs for the transaction. 