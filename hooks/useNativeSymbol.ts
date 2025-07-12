"use client";
import { useEffect, useState } from "react";
import { Network } from "../lib/contracts";
import { getNativeSymbol } from "../lib/native";

export function useNativeSymbol(network?: Network) {
  const [symbol, setSymbol] = useState("ETH");

  useEffect(() => {
    if (network) {
      setSymbol(network === "main" ? "MATIC" : "ETH");
      return;
    }

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
      const envId = Number(
        process.env.NEXT_PUBLIC_CHAIN_ID_MAIN ||
          process.env.NEXT_PUBLIC_CHAIN_ID_TEST ||
          "137"
      );
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
