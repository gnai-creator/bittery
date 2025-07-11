"use client";
import { ethers } from "ethers";
import { useTranslations } from "next-intl";

interface Props {
  onConnect: (provider: ethers.BrowserProvider, signer: ethers.JsonRpcSigner) => void;
}

export default function ConnectWalletButton({ onConnect }: Props) {
  const t = useTranslations("common");
  async function connect() {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      alert(t("metamaskRequired"));
      return;
    }
    try {
      const ethereum = (window as any).ethereum;
      if (typeof ethereum.setMaxListeners === "function") {
        ethereum.setMaxListeners(100);
      }
      const provider = new ethers.BrowserProvider(ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      onConnect(provider, signer);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <button
      onClick={connect}
      className="rounded bg-black text-white px-6 py-2 hover:bg-gray-800 transition-colors"
    >
      {t("connectWallet")}
    </button>
  );
}
