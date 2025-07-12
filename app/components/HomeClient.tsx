"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import lotteryAbi from "../../contracts/Bittery.json";
import InfoCarousel from "./InfoCarousel";
import ReferralLink from "./ReferralLink";
import EarningsTable from "./EarningsTable";
import { Link, usePathname } from "../../navigation";
import { useTranslations, useLocale } from "next-intl";
import { useNativeSymbol } from "../../hooks/useNativeSymbol";
import { useUsdPrices } from "../../hooks/useUsdPrices";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const LAUNCH_DATE = new Date("2025-08-05T20:00:00-03:00").getTime();

export default function HomeClient() {
  const pathname = usePathname();
  const [provider, setProvider] = useState<ethers.BrowserProvider>();
  const [signer, setSigner] = useState<ethers.JsonRpcSigner>();
  const [players, setPlayers] = useState<string[]>([]);
  const [winner, setWinner] = useState<string>("");
  const [winners, setWinners] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [contract, setContract] = useState<ethers.Contract>();
  const [animate, setAnimate] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [launchCountdown, setLaunchCountdown] = useState("");
  const t = useTranslations("common");
  const locale = useLocale();
  const network = pathname.includes("/main") ? "main" : "test";
  const symbol = useNativeSymbol(network);
  const prices = useUsdPrices();
  const TICKET_PRICE = 0.01;
  const ticketPriceUSD =
    symbol !== "UNKNOWN" && (symbol === "ETH" ? prices.ETH : prices.MATIC)
      ? (
          TICKET_PRICE * (symbol === "ETH" ? prices.ETH! : prices.MATIC!)
        ).toFixed(2)
      : null;

  useEffect(() => {
    setAnimate(true);
  }, []);

  useEffect(() => {
    const calc = () => {
      const now = Date.now();
      const diff = LAUNCH_DATE - now;
      if (diff <= 0) {
        setLaunched(true);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setLaunchCountdown(
          `${days} days, ${hours} hours and ${minutes} minutes`
        );
        setLaunched(false);
      }
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const next = getNextDraw();
      const diff = next.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      localStorage.setItem("referrer", ref);
    }
  }, []);

  async function connect() {
    if ((window as any).ethereum) {
      const prov = new ethers.BrowserProvider((window as any).ethereum);
      await prov.send("eth_requestAccounts", []);
      setProvider(prov);
      setSigner(await prov.getSigner());
    }
  }

  function getNextDraw() {
    const now = new Date();
    const next = new Date(now);
    next.setUTCDate(now.getUTCDate() + ((7 - now.getUTCDay()) % 7));
    next.setUTCHours(20, 0, 0, 0);
    if (next <= now) {
      next.setUTCDate(next.getUTCDate() + 7);
    }
    return next;
  }

  return (
    <main
      className={`flex flex-col items-center justify-center w-full px-4 py-12 text-center gap-8 ${
        animate ? "animate-fade" : ""
      }`}
    >
      <div className="flex justify-center gap-4">
        <button
          className="rounded dark:bg-neutral-900 text-white px-6 py-2 hover:bg-gray-800 transition-colors"
          onClick={connect}
        >
          {t("connectWallet")}
        </button>
      </div>
      
      <header className="space-y-2">
        <img
          src="/Bittery-Logo.png"
          alt="Bittery Logo"
          className="mx-auto w-32 h-32"
        />
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight title">
          {t("title")}
        </h1>
        <Link href="/terms" className="text-sm text-gray-500 hover:underline">
          {t("terms")} •
        </Link>{" "}
        <Link href="/privacy" className="text-sm text-gray-500 hover:underline">
          {t("privacyPolicy")} •
        </Link>{" "}
        {t("allRightsReserved", { year: 2025 })}{" "}
        <span className="font-semibold">{t("bitteryLLC")}</span>
        <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
          {t("subtitle")}
        </p>
      </header>
      <div id="status" className="text-lg">
        {launched
          ? t("statusLaunched")
          : t("statusCountdown", { time: launchCountdown })}
      </div>

      <InfoCarousel />

      

      <ReferralLink />
      <EarningsTable />
    </main>
  );
}
