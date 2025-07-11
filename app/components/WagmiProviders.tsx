"use client";
import { WagmiConfig, http } from "wagmi";
import { polygon, polygonMumbai } from "wagmi/chains";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { ReactNode } from "react";

export default function WagmiProviders({ children }: { children: ReactNode }) {
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
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
    </WagmiConfig>
  );
}
