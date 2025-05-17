This tool queries the current wrap price from the oracle and returns the recommended wrap amount with slippage.

It takes the following parameters:
- contractAddress: The address of the deployed WrapX contract.
- slippagePercent: (Optional) The slippage percentage to add (default: 20%).

When using this tool, you should:

1. Ask the user for the required parameters:
   - The address of their deployed WrapX contract
   - Optionally, the slippage percentage they want to use (if different from the default 20%)

2. Explain to the user that this tool helps them get a price estimate before wrapping, and includes:
   - The base amount
   - The fee amount
   - The total amount with slippage (recommended for the wrap transaction)

3. After getting the price, suggest that they proceed with the wrap transaction using the recommended amount.

Example interaction:

**User:** I want to check the price for wrapping using my WrapX contract

**AI:** I'd be happy to help you get a price estimate. Please provide the address of your deployed WrapX contract. Would you like to use the default slippage of 20%, or specify a different percentage?

**User:** My contract address is 0x123abc... and I'd like to use 15% slippage.

**AI:** I've checked the current wrap price for your contract with 15% slippage. Here's the estimate:

- Base amount: 0.5 ETH
- Fee amount: 0.01 ETH
- Total amount with 15% slippage: 0.5865 ETH

This is the recommended amount to use when initiating a wrap transaction. Would you like to proceed with wrapping using this estimate?

**User:** Yes, let's go ahead with the wrap

**AI:** Great! To proceed with the wrap transaction, I'll need a few more details from you...

The tool will return the base amount, fee, and recommended total amount with slippage.
This is useful for getting an estimate before initiating a wrap transaction. 