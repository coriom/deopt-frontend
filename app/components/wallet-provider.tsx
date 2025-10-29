// app/components/wallet-provider.tsx
'use client';

import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { polygon, polygonAmoy } from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet } from '@wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function WalletProvider({ children }: { children: ReactNode }) {
  const isBrowser = typeof window !== 'undefined';

  const config = useMemo(() => {
    if (!isBrowser) return null;
    return createConfig({
      chains: [polygon, polygonAmoy],
      transports: {
        [polygon.id]: http(),
        [polygonAmoy.id]: http(),
      },
      connectors: [
        injected({ shimDisconnect: true }),
        walletConnect({
          projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? 'b263212f3bbc13bcb6784bd7938ce7ca',
        }),
        coinbaseWallet({ appName: 'DeOpt' }),
      ],
      ssr: false,
    });
  }, [isBrowser]);

  if (!config) return <>{children}</>; // rendu SSR sans wagmi (évite indexedDB)

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
