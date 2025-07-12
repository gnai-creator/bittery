"use client";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useNativeSymbol } from "../../hooks/useNativeSymbol";
import { useUsdPrices } from "../../hooks/useUsdPrices";

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

const REF_PERCENT_ETH = 0.00025; // 2.5% of 0.01 ETH
function generateData(
  start = 2,
  end = 50,
  offset = 1,
  usdRate = 3000,
  factor = 1
): RowData[] {
  const data: RowData[] = [];
  for (let players = start; players <= end; players += offset) {
    const referrals = players - 1;
    const referralEarningsETH = referrals * REF_PERCENT_ETH * factor;
    const referralEarningsUSD = referralEarningsETH * usdRate;
    const chance = 1 / players;
    const prizePoolETH = 0.0095 * players * factor;
    const prizePoolUSD = prizePoolETH * usdRate;
    const totalPotentialUSD = referralEarningsUSD + prizePoolUSD * chance;
    data.push({
      players,
      referrals,
      referralEarningsETH,
      referralEarningsUSD,
      chance,
      prizePoolETH,
      prizePoolUSD,
      totalPotentialUSD,
    });
  }
  return data;
}

export default function EarningsTable() {
  const t = useTranslations("common");
  const symbol = useNativeSymbol();
  const prices = useUsdPrices();
  const usdRate =
    symbol === "ETH"
      ? prices.ETH ?? 3000
      : symbol === "POL"
      ? prices.POL ?? 1
      : 3000;
  const factor =
    symbol === "POL" && prices.ETH && prices.POL ? prices.ETH / prices.POL : 1;
  const rows = useMemo(
    () => generateData(2, 1000, 100, usdRate, factor),
    [usdRate, factor]
  );
  return (
    <div className="overflow-x-auto w-full max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold title mb-2">
        {t("lotteryEarningsTable")}
      </h2>
      <table className="min-w-full text-sm border-collapse border">
        <thead>
          <tr>
            <th className="border px-2">{t("tablePlayers")}</th>
            <th className="border px-2">{t("tableReferrals")}</th>
            <th className="border px-2">
              {t("tableReferralEarningsETH", { symbol })}
            </th>
            <th className="border px-2">{t("tableReferralEarningsUSD")}</th>
            <th className="border px-2">{t("tableChanceToWin")}</th>
            <th className="border px-2">
              {t("tablePrizePoolETH", { symbol })}
            </th>
            <th className="border px-2">{t("tablePrizePoolUSD")}</th>
            <th className="border px-2">{t("tableTotalPotentialGainUSD")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.players}>
              <td className="border px-2 text-center">{row.players}</td>
              <td className="border px-2 text-center">{row.referrals}</td>
              <td className="border px-2 text-right">
                {row.referralEarningsETH.toFixed(6)}
              </td>
              <td className="border px-2 text-right">
                {row.referralEarningsUSD.toFixed(2)}
              </td>
              <td className="border px-2 text-right">
                {row.chance.toFixed(4)}
              </td>
              <td className="border px-2 text-right">
                {row.prizePoolETH.toFixed(6)}
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
  );
}
