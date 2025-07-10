"use client";
import { useMemo } from "react";

interface RowData {
  players: number;
  referrals: number;
  referralEarningsETH: number;
  referralEarningsBRL: number;
  chance: number;
  prizePoolETH: number;
  prizePoolBRL: number;
  totalPotentialBRL: number;
}

const ETH_TO_BRL = 15400;
const REF_PERCENT_ETH = 0.00025; // 2.5% of 0.01 ETH

function generateData(start = 2, end = 50): RowData[] {
  const data: RowData[] = [];
  for (let players = start; players <= end; players++) {
    const referrals = players - 1;
    const referralEarningsETH = referrals * REF_PERCENT_ETH;
    const referralEarningsBRL = referralEarningsETH * ETH_TO_BRL;
    const chance = 1 / players;
    const prizePoolETH = 0.0095 * players;
    const prizePoolBRL = prizePoolETH * ETH_TO_BRL;
    const totalPotentialBRL = referralEarningsBRL + prizePoolBRL * chance;
    data.push({
      players,
      referrals,
      referralEarningsETH,
      referralEarningsBRL,
      chance,
      prizePoolETH,
      prizePoolBRL,
      totalPotentialBRL,
    });
  }
  return data;
}

export default function EarningsTable() {
  const rows = useMemo(() => generateData(), []);
  return (
    <div className="overflow-x-auto w-full max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold title mb-2">Lottery Earnings Table</h2>
      <table className="min-w-full text-sm border-collapse border">
        <thead>
          <tr>
            <th className="border px-2">Players</th>
            <th className="border px-2">Referrals</th>
            <th className="border px-2">Referral Earnings (ETH)</th>
            <th className="border px-2">Referral Earnings (R$)</th>
            <th className="border px-2">Chance to Win</th>
            <th className="border px-2">Prize Pool (ETH)</th>
            <th className="border px-2">Prize Pool (R$)</th>
            <th className="border px-2">Total Potential Gain (R$)</th>
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
                {row.referralEarningsBRL.toFixed(2)}
              </td>
              <td className="border px-2 text-right">{row.chance.toFixed(4)}</td>
              <td className="border px-2 text-right">{row.prizePoolETH.toFixed(6)}</td>
              <td className="border px-2 text-right">{row.prizePoolBRL.toFixed(2)}</td>
              <td className="border px-2 text-right">{row.totalPotentialBRL.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
