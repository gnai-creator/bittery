"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import lotteryAbi from "../../contracts/Bittery.json";
import InfoCarousel from "./InfoCarousel";
import ReferralLink from "./ReferralLink";
import EarningsTable from "./EarningsTable";
import Link from "next/link";
import { useTranslations } from "next-intl";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const LAUNCH_DATE = new Date("2025-08-05T20:00:00-03:00").getTime();

export default function HomeClient() {
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

  useEffect(() => {
    if (!provider) return;
    const c = new ethers.Contract(CONTRACT_ADDRESS, lotteryAbi.abi, provider);
    setContract(c);
    getPlayers(c);
    getWinner(c);
    getWinners(c);
    c.on("WinnerPicked", () => {
      getWinner(c);
      getWinners(c);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  async function connect() {
    if ((window as any).ethereum) {
      const prov = new ethers.BrowserProvider((window as any).ethereum);
      await prov.send("eth_requestAccounts", []);
      setProvider(prov);
      setSigner(await prov.getSigner());
    }
  }

  async function buy() {
    if (!contract || !signer) return;
    const referrer =
      (typeof window !== "undefined" && localStorage.getItem("referrer")) ||
      ZERO_ADDRESS;
    const tx = await (contract as any)
      .connect(signer)
      .buyTicket(referrer, { value: ethers.parseEther("0.01") });
    await tx.wait();
    getPlayers(contract);
  }

  async function getPlayers(c: ethers.Contract) {
    const list: string[] = await c.getPlayers();
    setPlayers(list);
  }

  async function getWinner(c: ethers.Contract) {
    const w: string = await c.recentWinner();
    setWinner(w);
  }

  async function getWinners(c: ethers.Contract) {
    const list: string[] = await c.getWinners();
    setWinners(list.slice(-5).reverse());
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
      <header className="space-y-2">
        <img
          src="/Bittery-Logo.png"
          alt="Bittery Logo"
          className="mx-auto w-32 h-32"
        />
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight title">
          {t("title")}
        </h1>
        <Link href={"terms"} className="text-sm text-gray-500 hover:underline">
          {t("terms")} •
        </Link>{" "}
        <Link
          href={"privacy"}
          className="text-sm text-gray-500 hover:underline"
        >
          {t("privacyPolicy")} •
        </Link>{" "}
        {t("allRightsReserved", { year: 2025 })} {" "}
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
      {launched && (
        <p className="text-lg">{t("nextDrawIn", { time: timeLeft })}</p>
      )}
      <InfoCarousel />

      <div className="flex justify-center p-4">
        <video controls autoPlay loop className="w-64 rounded-lg shadow-md">
          <source src="/Bittery - Always a Winner.mp4" type="video/mp4" />
          {t("videoUnsupported")}
        </video>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          className="rounded bg-black text-white px-6 py-2 hover:bg-gray-800 transition-colors"
          onClick={connect}
        >
          {t("connectWallet")}
        </button>
        {launched && (
          <button
            id="buy-button"
            className="rounded border border-gray-800 dark:border-gray-200 px-6 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={buy}
          >
            {t("buyTicket", { price: "0.01" })}
          </button>
        )}
      </div>
      {!launched && <EarningsTable />}
      {launched && <ReferralLink />}
      <div className="w-full max-w-md text-left">
        <h2 className="text-xl font-semibold mb-2">
          {t("playersHeading")} ({players.length})
        </h2>
        <ul className="space-y-1">
          {players.map((p) => (
            <li key={p} className="truncate">
              {p}
            </li>
          ))}
        </ul>
      </div>
      {winner && (
        <div>
          <h2 className="text-xl font-semibold">{t("lastWinner")}</h2>
          <p className="truncate">{winner}</p>
        </div>
      )}
      {winners.length > 0 && (
        <div className="w-full max-w-md text-left">
          <h2 className="text-xl font-semibold mb-2">{t("recentWinners")}</h2>
          <ul className="space-y-1">
            {winners.map((w) => (
              <li key={w} className="truncate">
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
