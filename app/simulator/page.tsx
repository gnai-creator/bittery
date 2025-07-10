"use client";

import { useState, useMemo, useEffect } from "react";

const ETH_TO_BRL = 15400;
const REF_PERCENT_ETH = 0.00025; // 2.5% of 0.01 ETH

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

function generateData(): RowData[][] {
  const groups: RowData[][] = [];
  let group: RowData[] = [];
  for (let players = 2; players <= 1000; players++) {
    const referrals = players - 1;
    const referralEarningsETH = referrals * REF_PERCENT_ETH;
    const referralEarningsBRL = referralEarningsETH * ETH_TO_BRL;
    const chance = 1 / players;
    const prizePoolETH = 0.0095 * players;
    const prizePoolBRL = prizePoolETH * ETH_TO_BRL;
    const totalPotentialBRL = referralEarningsBRL + prizePoolBRL * chance;
    group.push({
      players,
      referrals,
      referralEarningsETH,
      referralEarningsBRL,
      chance,
      prizePoolETH,
      prizePoolBRL,
      totalPotentialBRL,
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

export default function SimulatorPage() {
  const [weeklyReferrals, setWeeklyReferrals] = useState(0);
  const groups = useMemo(() => generateData(), []);

  const weeklyETH = weeklyReferrals * REF_PERCENT_ETH;
  const weeklyBRL = weeklyETH * ETH_TO_BRL;
  const monthlyBRL = weeklyBRL * 4;
  const yearlyBRL = weeklyBRL * 52;

  const dispWeeklyETH = useAnimatedNumber(weeklyETH);
  const dispWeeklyBRL = useAnimatedNumber(weeklyBRL);
  const dispMonthlyBRL = useAnimatedNumber(monthlyBRL);
  const dispYearlyBRL = useAnimatedNumber(yearlyBRL);

  return (
    <main className="px-4 py-8 space-y-8 max-w-7xl mx-auto">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold title">Referral Earnings Simulator</h1>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <label className="font-medium">
            Weekly referred players:
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
            <h2 className="font-semibold">Weekly</h2>
            <p>{dispWeeklyETH.toFixed(6)} ETH</p>
            <p>R$ {dispWeeklyBRL.toFixed(2)}</p>
          </div>
          <div className="border rounded p-4 bg-white dark:bg-neutral-900 shadow">
            <h2 className="font-semibold">Monthly</h2>
            <p>R$ {dispMonthlyBRL.toFixed(2)}</p>
          </div>
          <div className="border rounded p-4 bg-white dark:bg-neutral-900 shadow">
            <h2 className="font-semibold">Yearly</h2>
            <p>R$ {dispYearlyBRL.toFixed(2)}</p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold title">Referral & Prize Table</h2>
        {groups.map((group, i) => (
          <div key={i} className="overflow-x-auto">
            <h3 className="font-semibold my-2">
              Players {group[0].players}-{group[group.length - 1].players}
            </h3>
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
                {group.map((row) => (
                  <tr key={row.players}>
                    <td className="border px-2 text-center">{row.players}</td>
                    <td className="border px-2 text-center">{row.referrals}</td>
                    <td className="border px-2 text-right">
                      {row.referralEarningsETH.toFixed(6)}
                    </td>
                    <td className="border px-2 text-right">
                      {row.referralEarningsBRL.toFixed(2)}
                    </td>
                    <td className="border px-2 text-right">
                      {row.chance.toFixed(4)}
                    </td>
                    <td className="border px-2 text-right">
                      {row.prizePoolETH.toFixed(6)}
                    </td>
                    <td className="border px-2 text-right">
                      {row.prizePoolBRL.toFixed(2)}
                    </td>
                    <td className="border px-2 text-right">
                      {row.totalPotentialBRL.toFixed(2)}
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
