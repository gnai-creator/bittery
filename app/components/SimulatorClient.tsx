"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useNativeSymbol } from "../../hooks/useNativeSymbol";
import { useUsdPrices } from "../../hooks/useUsdPrices";

const ETH_TO_USD = 3000;
const REF_PERCENT_ETH = 0.00025; // 2.5% of 0.01 ETH

interface RowData {
  players: number;
  referrals: number;
  referralEarningsETH: number;
  referralEarningsUSD: number;
  chance: number;
  prizePoolETH: number;
  prizePoolUSD: number;
  totalPotentialUSD: number;
}

function generateData(factor = 1, usdRate = ETH_TO_USD): RowData[][] {
  const groups: RowData[][] = [];
  let group: RowData[] = [];
  for (let players = 2; players <= 1000; players++) {
    const referrals = players - 1;
    const referralEarningsETH = referrals * REF_PERCENT_ETH * factor;
    const referralEarningsUSD = referralEarningsETH * usdRate;
    const chance = 1 / players;
    const prizePoolETH = 0.0095 * players * factor;
    const prizePoolUSD = prizePoolETH * usdRate;
    const totalPotentialUSD = referralEarningsUSD + prizePoolUSD * chance;
    group.push({
      players,
      referrals,
      referralEarningsETH,
      referralEarningsUSD,
      chance,
      prizePoolETH,
      prizePoolUSD,
      totalPotentialUSD,
    });
    if (group.length === 50) {
      groups.push(group);
      group = [];
    }
  }
  if (group.length) groups.push(group);
  return groups;
}

function useAnimatedNumber(value: number, duration = 400) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    const start = display;
    const startTime = performance.now();
    let frame: number;
    const tick = () => {
      const now = performance.now();
      const progress = Math.min(1, (now - startTime) / duration);
      setDisplay(start + (value - start) * progress);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);
  return display;
}

export default function SimulatorClient() {
  const t = useTranslations("common");
  const symbol = useNativeSymbol();
  const prices = useUsdPrices();
  const [weeklyReferrals, setWeeklyReferrals] = useState(0);
  const usdRate =
    symbol === "ETH"
      ? prices.ETH ?? ETH_TO_USD
      : symbol === "POL"
      ? prices.POL ?? 1
      : ETH_TO_USD;
  const factor =
    symbol === "POL" && prices.ETH && prices.POL ? prices.ETH / prices.POL : 1;
  const groups = useMemo(
    () => generateData(factor, usdRate),
    [factor, usdRate]
  );

  const weeklyETH = weeklyReferrals * REF_PERCENT_ETH * factor;
  const weeklyUSD = weeklyETH * usdRate;
  const monthlyUSD = weeklyUSD * 4;
  const yearlyUSD = weeklyUSD * 52;

  const dispWeeklyETH = useAnimatedNumber(weeklyETH);
  const dispWeeklyUSD = useAnimatedNumber(weeklyUSD);
  const dispMonthlyUSD = useAnimatedNumber(monthlyUSD);
  const dispYearlyUSD = useAnimatedNumber(yearlyUSD);

  return (
    <main className="px-4 py-8 space-y-8 max-w-7xl mx-auto">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold title">{t("simulatorTitle")}</h1>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <label className="font-medium">
            {t("weeklyReferredPlayers")}
            <input
              type="number"
              min={1}
              max={1000000}
              value={weeklyReferrals}
              onChange={(e) => setWeeklyReferrals(Number(e.target.value))}
              className="ml-2 border rounded p-1 w-32 text-black"
            />
          </label>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 pt-4">
          <div className="border rounded p-4 bg-white dark:bg-neutral-900 shadow">
            <h2 className="font-semibold">{t("weekly")}</h2>
            <p>{dispWeeklyETH.toFixed(6)} {symbol}</p>
            <p>$ {dispWeeklyUSD.toFixed(2)}</p>
          </div>
          <div className="border rounded p-4 bg-white dark:bg-neutral-900 shadow">
            <h2 className="font-semibold">{t("monthly")}</h2>
            <p>$ {dispMonthlyUSD.toFixed(2)}</p>
          </div>
          <div className="border rounded p-4 bg-white dark:bg-neutral-900 shadow">
            <h2 className="font-semibold">{t("yearly")}</h2>
            <p>$ {dispYearlyUSD.toFixed(2)}</p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold title">{t("referralPrizeTable")}</h2>
        {groups.map((group, i) => (
          <div key={i} className="overflow-x-auto">
            <h3 className="font-semibold my-2">
              Players {group[0].players}-{group[group.length - 1].players}
            </h3>
            <table className="min-w-full text-sm border-collapse border">
              <thead>
                <tr>
                  <th className="border px-2">{t("tablePlayers")}</th>
                  <th className="border px-2">{t("tableReferrals")}</th>
                  <th className="border px-2">{t("tableReferralEarningsETH", { symbol })}</th>
                  <th className="border px-2">{t("tableReferralEarningsUSD")}</th>
                  <th className="border px-2">{t("tableChanceToWin")}</th>
                  <th className="border px-2">{t("tablePrizePoolETH", { symbol })}</th>
                  <th className="border px-2">{t("tablePrizePoolUSD")}</th>
                  <th className="border px-2">{t("tableTotalPotentialGainUSD")}</th>
                </tr>
              </thead>
              <tbody>
                {group.map((row) => (
                  <tr key={row.players}>
                    <td className="border px-2 text-center">{row.players}</td>
                    <td className="border px-2 text-center">{row.referrals}</td>
                    <td className="border px-2 text-right">
                      {row.referralEarningsETH.toFixed(6)} {symbol}
                    </td>
                    <td className="border px-2 text-right">
                      {row.referralEarningsUSD.toFixed(2)}
                    </td>
                    <td className="border px-2 text-right">
                      {row.chance.toFixed(4)}
                    </td>
                    <td className="border px-2 text-right">
                      {row.prizePoolETH.toFixed(6)} {symbol}
                    </td>
                    <td className="border px-2 text-right">
                      {row.prizePoolUSD.toFixed(2)}
                    </td>
                    <td className="border px-2 text-right">
                      {row.totalPotentialUSD.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </main>
  );
}
