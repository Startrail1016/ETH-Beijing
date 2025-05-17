import { http, createConfig } from 'wagmi'
import { bscTestnet } from 'wagmi/chains'

export const config = createConfig({
  chains: [bscTestnet],
  connectors: [],
  transports: {
    [bscTestnet.id]: http(),
  },
})