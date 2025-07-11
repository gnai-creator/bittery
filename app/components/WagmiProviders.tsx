"use client";
import { WagmiConfig, http } from "wagmi";
import { polygon, polygonMumbai } from "wagmi/chains";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function WagmiProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const wagmiConfig = getDefaultConfig({
    appName: "Bittery",
    projectId: "bittery",
    chains: [polygon, polygonMumbai] as const,
    transports: {
      [polygon.id]: http(),
      [polygonMumbai.id]: http(),
    },
  });
  const { chains } = wagmiConfig;
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}
