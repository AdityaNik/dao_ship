import { http, createConfig } from 'wagmi'
import { avalancheFuji, base, mainnet, optimism } from 'wagmi/chains'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'

const projectId = import.meta.env.VITE_PROJECT_ID

export const config = createConfig({
  chains: [mainnet, base, avalancheFuji],
  connectors: [
    injected(),
    walletConnect({ projectId }),
    metaMask(),
    safe(),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [avalancheFuji.id]: http(),
  },
})