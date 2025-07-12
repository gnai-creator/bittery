"use client";
import { useEffect, useState } from "react";
import { getContractConfig, Network } from "../lib/contracts";
import { getNativeSymbol } from "../lib/native";

export function useNativeSymbol(network?: Network) {
  const [symbol, setSymbol] = useState("ETH");

  useEffect(() => {
    let active = true;
    function updateFromChain(chainIdHex: string) {
      const id = parseInt(chainIdHex, 16);
      if (active) setSymbol(getNativeSymbol(id));
    }

    const ethereum =
      typeof window !== "undefined" ? (window as any).ethereum : undefined;
    if (ethereum?.chainId) {
      updateFromChain(ethereum.chainId as string);
    } else {
      const envId = network
        ? getContractConfig(network).chainId
        : Number(process.env.NEXT_PUBLIC_CHAIN_ID_MAIN || "137");
      setSymbol(getNativeSymbol(envId));
    }
    if (ethereum?.on) {
      ethereum.on("chainChanged", updateFromChain);
      return () => {
        active = false;
        ethereum.removeListener?.("chainChanged", updateFromChain);
      };
    }
    return () => {
      active = false;
    };
  }, [network]);

  return symbol;
}
