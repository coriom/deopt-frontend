'use client';

import type { ReactNode } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { polygon, polygonAmoy } from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// wagmi config
const config = createConfig({
  chains: [polygon, polygonAmoy],
  transports: {
    [polygon.id]: http(),       // utilise les RPC publics par défaut (OK pour démarrer)
    [polygonAmoy.id]: http(),
  },
  connectors: [
    injected({ shimDisconnect: true }),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? 'b263212f3bbc13bcb6784bd7938ce7ca',
    }),
    coinbaseWallet({ appName: 'DeOpt' }),
  ],
  ssr: false, // côté client uniquement
});

// react-query
const queryClient = new QueryClient();

export default function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
