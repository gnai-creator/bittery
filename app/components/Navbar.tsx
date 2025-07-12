"use client";
import { useState, useEffect } from "react";
import { Link, usePathname } from "../../navigation";
import { useAccount } from "wagmi";
import { useBitteryContract } from "../../hooks/useBitteryContract";
import { Network } from "../../lib/contracts";
import { ethers } from "ethers";
import { useNativeSymbol } from "../../hooks/useNativeSymbol";

function short(addr: string) {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

export default function Navbar() {
  const pathname = usePathname();
  const network: Network = pathname.includes("/main") ? "main" : "test";
  const { address, isConnected } = useAccount();
  const contract = useBitteryContract(network);
  const symbol = useNativeSymbol(network);
  const [balance, setBalance] = useState<string>("0");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!address) return;
    async function load() {
      try {
        const val = await contract.payments(address);
        setBalance(ethers.formatEther(val));
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [address, contract]);

  async function withdraw() {
    if (!address) return;
    try {
      const provider = contract.runner as ethers.BrowserProvider;
      const signer = await provider.getSigner();
      const tx = await (contract as any)
        .connect(signer)
        .withdrawPayments(address);
      await tx.wait();
      const val = await contract.payments(address);
      setBalance(ethers.formatEther(val));
      setOpen(false);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <nav className="bg-neutral-900 text-white flex items-center px-4 py-2 gap-4">
      <Link href="/" className="flex items-center gap-2">
        <img src="/nav.png" alt="Logo" width={40} height={40} />
      </Link>
      <div className="flex-1 flex justify-center gap-2">
        <Link
          href="/main"
          className={`px-4 py-1 rounded text-sm ${
            network === "main" ? "bg-orange-600" : "bg-orange-500"
          } hover:bg-orange-700`}
        >
          Mainnet
        </Link>
        <Link
          href="/test"
          className={`px-4 py-1 rounded text-sm ${
            network === "test" ? "bg-orange-600" : "bg-orange-500"
          } hover:bg-orange-700`}
        >
          Testnet
        </Link>
      </div>
      <div className="relative">
        {isConnected && address ? (
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 hover:opacity-80"
          >
            <img src="/wallet.svg" alt="Wallet" className="w-6 h-6" />
            <span className="hidden sm:block">{short(address)}</span>
          </button>
        ) : (
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              (window as any).ethereum?.request?.({
                method: "eth_requestAccounts",
              });
            }}
            className="px-3 py-1 rounded bg-orange-600 hover:bg-orange-700 text-sm"
          >
            Connect
          </Link>
        )}
        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded shadow-lg p-4 space-y-2 text-sm z-50">
            <div className="flex justify-between">
              <span>Balance</span>
              <span>
                {Number(balance).toFixed(4)} {symbol}
              </span>
            </div>
            <button
              onClick={withdraw}
              className="w-full bg-orange-600 hover:bg-orange-700 rounded px-2 py-1"
            >
              Withdraw
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
