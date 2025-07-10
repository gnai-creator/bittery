"use client";
import { useState } from "react";
import { ethers } from "ethers";
import ConnectWalletButton from "./ConnectWalletButton";
import AdminPanel from "./AdminPanel";

export default function AdminClient() {
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
