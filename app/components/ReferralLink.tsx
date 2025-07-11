"use client";
import { useState } from "react";
import { ethers } from "ethers";
import { useTranslations } from "next-intl";

const ETH_TO_USD = 3000; // 1 ETH ≈ $3,000
const TICKET_PRICE_ETH = 0.01;
const COMMISSION_PERCENT = 0.025;

export default function ReferralLink() {
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const t = useTranslations("common");

  async function generate() {
    if (typeof window === "undefined" || !(window as any).ethereum) return;
    const ethereum = (window as any).ethereum;
    let address: string | undefined = ethereum.selectedAddress;

    try {
      if (!address) {
        const provider = new ethers.BrowserProvider(ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        address = accounts[0];
      }
      if (!address) return;
      const url = `https://bitaward.net/?ref=${address}`;
      setLink(url);
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch (err) {
      console.error(err);
    }
  }

  const reward = (TICKET_PRICE_ETH * COMMISSION_PERCENT * ETH_TO_USD).toFixed(2);

  return (
    <div className="space-y-2">
      <button
        onClick={generate}
        className="rounded border border-gray-800 dark:border-gray-200 px-6 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {t("generateReferralLink")}
      </button>
      {copied && (
        <div className="space-y-1">
          <p>
            {t("linkCopied")} 🟢 {link}
          </p>
          <p>
            {t("referralReward", { reward })}
          </p>
        </div>
      )}
    </div>
  );
}
