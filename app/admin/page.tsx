"use client";
import { useState } from "react";
import { ethers } from "ethers";
import ConnectWalletButton from "../components/ConnectWalletButton";
import AdminPanel from "../components/AdminPanel";

export default function AdminPage() {
  const [provider, setProvider] = useState<ethers.BrowserProvider>();
  const [signer, setSigner] = useState<ethers.JsonRpcSigner>();

  return (
    <main className="flex flex-col items-center gap-6 p-6">
      <ConnectWalletButton
        onConnect={(prov, sig) => {
          setProvider(prov);
          setSigner(sig);
        }}
      />
      <AdminPanel provider={provider} signer={signer} />
    </main>
  );
}
