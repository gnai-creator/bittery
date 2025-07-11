"use client";
import { WagmiProvider, http } from "wagmi";
import { polygon, sepolia } from "wagmi/chains";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { ReactNode, useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function WagmiProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const wagmiConfig = useMemo(
    () =>
      getDefaultConfig({
        appName: "Bittery",
        projectId:
          process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "bittery",
        chains: [polygon, sepolia] as const,
        transports: {
          [polygon.id]: http(process.env.NEXT_PUBLIC_POLYGON_RPC_URL || ""),
          [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || ""),
        },
      }),
    []
  );
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
