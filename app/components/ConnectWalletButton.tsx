"use client";
import { ethers } from "ethers";

interface Props {
  onConnect: (provider: ethers.BrowserProvider, signer: ethers.JsonRpcSigner) => void;
}

export default function ConnectWalletButton({ onConnect }: Props) {
  async function connect() {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      alert("MetaMask is required");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
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
      Connect Wallet
    </button>
  );
}
