'use client';

import type { ReactNode } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { polygon, polygonAmoy } from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fallback } from 'viem';

const queryClient = new QueryClient();

// Permets d’override via .env, sinon on prend des publics
const POLYGON_RPC = process.env.NEXT_PUBLIC_RPC_POLYGON;
const AMOY_RPC = process.env.NEXT_PUBLIC_RPC_POLYGON_AMOY;

const config = createConfig({
  chains: [polygon, polygonAmoy],
  transports: {
    [polygon.id]: fallback([
      http(POLYGON_RPC ?? 'https://polygon-rpc.com'),
      http('https://rpc.ankr.com/polygon'),
      // tu peux en ajouter d'autres si tu veux
    ]),
    [polygonAmoy.id]: fallback([
      http(AMOY_RPC ?? 'https://rpc-amoy.polygon.technology'),
      // ajoute ici d'autres RPC Amoy si tu en as
    ]),
  },
  connectors: [
    injected({ shimDisconnect: true }),
    walletConnect({
      projectId:
        process.env.NEXT_PUBLIC_WC_PROJECT_ID ??
        'b263212f3bbc13bcb6784bd7938ce7ca',
    }),
    coinbaseWallet({ appName: 'DeOpt' }),
  ],
  ssr: true,
});

export default function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
