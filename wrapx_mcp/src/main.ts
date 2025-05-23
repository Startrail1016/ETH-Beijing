import {
  AgentKit,
  basenameActionProvider,
  cdpApiActionProvider,
  cdpWalletActionProvider,
  CdpWalletProvider,
  morphoActionProvider,
  walletActionProvider,
  ViemWalletProvider
} from '@coinbase/agentkit';
import { getMcpTools } from '@coinbase/agentkit-model-context-protocol';
import { Coinbase } from '@coinbase/coinbase-sdk';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as dotenv from 'dotenv';
import {
  createWalletClient,
  http,
  publicActions,
  type PublicActions,
  type WalletClient
} from 'viem';
import { english, generateMnemonic, mnemonicToAccount, privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { Event, postMetric } from './analytics.js';
import { chainIdToCdpNetworkId, chainIdToChain } from './chains.js';
import { baseMcpTools, toolToHandler } from './tools/index.js';
import {
  generateSessionId,
  getActionProvidersWithRequiredEnvVars,
} from './utils.js';
import { version } from './version.js';

export async function main() {
  dotenv.config();
  const apiKeyName =
    process.env.COINBASE_API_KEY_ID || process.env.COINBASE_API_KEY_NAME; // Previously, was called COINBASE_API_KEY_NAME
  const apiPrivateKey =
    process.env.COINBASE_API_SECRET || process.env.COINBASE_API_PRIVATE_KEY; // Previously, was called COINBASE_API_PRIVATE_KEY
  const seedPhrase = process.env.SEED_PHRASE;
  const privateKey = process.env.PRIVATE_KEY;
  const fallbackPhrase = generateMnemonic(english, 256); // Fallback in case user wants read-only operations
  const chainId = process.env.CHAIN_ID ? Number(process.env.CHAIN_ID) : base.id;

  if (!apiKeyName || !apiPrivateKey) {
    console.error(
      'Please set COINBASE_API_KEY_NAME and COINBASE_API_PRIVATE_KEY environment variables',
    );
    process.exit(1);
  }

  // Check if we have a private key or seed phrase
  if (!privateKey && !seedPhrase) {
    console.error(
      'Please set either PRIVATE_KEY or SEED_PHRASE environment variable',
    );
    process.exit(1);
  }

  const sessionId = generateSessionId();

  postMetric(Event.Initialized, {}, sessionId);

  const chain = chainIdToChain(chainId);
  if (!chain) {
    throw new Error(
      `Unsupported chainId: ${chainId}. Only Base and Base Sepolia are supported.`,
    );
  }

  // Create viemClient based on available credentials
  let viemClient;
  if (privateKey) {
    // Use privateKey if available
    viemClient = createWalletClient({
      account: privateKeyToAccount(privateKey as `0x${string}`),
      chain,
      transport: http(),
    }).extend(publicActions) as WalletClient & PublicActions;
  } else {
    // Fall back to seed phrase
    viemClient = createWalletClient({
      account: mnemonicToAccount(seedPhrase ?? fallbackPhrase),
      chain,
      transport: http(),
    }).extend(publicActions) as WalletClient & PublicActions;
  }

  const evmWalletProvider = new ViemWalletProvider(viemClient);
  
  // Configure CDP wallet provider based on available credentials
  let cdpWalletProvider;
  // if (seedPhrase) {
  //   cdpWalletProvider = await CdpWalletProvider.configureWithWallet({
  //     mnemonicPhrase: seedPhrase,
  //     apiKeyName,
  //     apiKeyPrivateKey: apiPrivateKey,
  //     networkId: chainIdToCdpNetworkId[chainId],
  //   });
  // } else {
    // Use privateKey for CDP wallet
    // Note: This is a simplified approximation - actual implementation may need adjustment based on CDP API capabilities
    cdpWalletProvider = evmWalletProvider;
  // }

  const agentKit = await AgentKit.from({
    cdpApiKeyName: apiKeyName,
    cdpApiKeyPrivateKey: apiPrivateKey,
    walletProvider: privateKey ? evmWalletProvider : cdpWalletProvider,
    actionProviders: [
      basenameActionProvider(),
      morphoActionProvider(),
      walletActionProvider(),
      cdpWalletActionProvider({
        apiKeyName,
        apiKeyPrivateKey: apiPrivateKey,
      }),
      cdpApiActionProvider({
        apiKeyName,
        apiKeyPrivateKey: apiPrivateKey,
      }),
      ...getActionProvidersWithRequiredEnvVars(),
    ],
  });

  const { tools, toolHandler } = await getMcpTools(agentKit);

  const server = new Server(
    {
      name: 'Base MCP Server',
      version,
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  Coinbase.configure({
    apiKeyName,
    privateKey: apiPrivateKey,
    source: 'Base MCP',
    sourceVersion: version,
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error('Received ListToolsRequest');
    return {
      tools: [...baseMcpTools.map((tool) => tool.definition), ...tools],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      postMetric(Event.ToolUsed, { toolName: request.params.name }, sessionId);

      // Check if the tool is Base MCP tool
      const isBaseMcpTool = baseMcpTools.some(
        (tool) => tool.definition.name === request.params.name,
      );

      if (isBaseMcpTool) {
        const tool = toolToHandler[request.params.name];
        if (!tool) {
          throw new Error(`Tool ${request.params.name} not found`);
        }

        const result = await tool(viemClient, request.params.arguments);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result),
            },
          ],
        };
      }

      // Check requirements for wallet tools
      if (!privateKey && !seedPhrase) {
        return {
          content: [
            {
              type: 'text',
              text: 'ERROR: Please set either PRIVATE_KEY or SEED_PHRASE environment variable to use wallet-related operations',
            },
          ],
        };
      }

      return toolHandler(request.params.name, request.params.arguments);
    } catch (error) {
      throw new Error(`Tool ${request.params.name} failed: ${error}`);
    }
  });

  const transport = new StdioServerTransport();
  console.error('Connecting server to transport...');
  await server.connect(transport);

  console.error('Base MCP Server running on stdio');
}
