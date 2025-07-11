"use client";
import { WagmiConfig, http } from "wagmi";
import { polygon, sepolia } from "wagmi/chains";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function WagmiProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const wagmiConfig = getDefaultConfig({
    appName: "Bittery",
    projectId: "bittery",
    chains: [polygon, sepolia] as const,
    transports: {
      [polygon.id]: http(),
      [sepolia.id]: http(),
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}
