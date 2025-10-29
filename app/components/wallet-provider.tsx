"use client";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";


const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  connectors: [
    injected({ shimDisconnect: true }), 
    walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? "b263212f3bbc13bcb6784bd7938ce7ca" }),
    coinbaseWallet({ appName: "DeOpt" }),
  ],
  ssr: false,
});

const queryClient = new QueryClient();

export default function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
