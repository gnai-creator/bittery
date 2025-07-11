"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useTranslations } from "next-intl";
import { useBitteryContract } from "../../hooks/useBitteryContract";
import { Network } from "../../lib/contracts";
import { useNativeSymbol } from "../../hooks/useNativeSymbol";
import { useUsdPrices } from "../../hooks/useUsdPrices";

interface Props {
  network: Network;
  id: number;
}

export default function RoomCard({ network, id }: Props) {
  const contract = useBitteryContract(network);
  const [players, setPlayers] = useState<string[]>([]);
  const [winner, setWinner] = useState<string>("");
  const [drawing, setDrawing] = useState(false);
  const [price, setPrice] = useState(0);
  const [prize, setPrize] = useState(0);
  const [maxPlayers, setMaxPlayers] = useState(0);
  const symbol = useNativeSymbol(network);
  const prices = useUsdPrices();
  const t = useTranslations("common");

  async function refresh() {
    const room = await contract.rooms(id);
    setDrawing(room.drawing);
    setWinner(room.winner);
    const list = await contract.getRoomPlayers(id);
    setPlayers(list);
    setMaxPlayers(Number(room.maxPlayers));
    const p = Number(ethers.formatEther(room.ticketPrice));
    setPrice(p);
    setPrize(p * Number(room.maxPlayers) * 0.95);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract]);

  async function buy() {
    const provider = contract.runner as ethers.BrowserProvider;
    const signer = await provider.getSigner();
    const room = await contract.rooms(id);
    const ref =
      (typeof window !== "undefined" && localStorage.getItem("referrer")) ||
      ethers.ZeroAddress;
    const tx = await (contract as any).connect(signer).buyTicket(id, ref, {
      value: room.ticketPrice,
    });
    await tx.wait();
    refresh();
    alert("Ticket purchased!");
  }

  return (
    <div className="border rounded p-4 space-y-2 bg-white dark:bg-neutral-900">
      <button onClick={refresh} className="text-sm underline">
        Refresh
      </button>
      <div className="font-semibold">Room #{id}</div>
      <div>
        Players: {players.length}/{maxPlayers}
      </div>
      <div>
        Ticket Price: {price.toFixed(4)} {symbol}
        {symbol !== "UNKNOWN" &&
          (symbol === "ETH" ? prices.ETH : prices.POL) && (
            <span className="ml-1 text-sm text-gray-500">
              (~ ${" "}
              {(price * (symbol === "ETH" ? prices.ETH! : prices.POL!)).toFixed(
                2
              )}
              )
            </span>
          )}
      </div>
      <div>
        Prize: {prize.toFixed(4)} {symbol}
        {symbol !== "UNKNOWN" &&
          (symbol === "ETH" ? prices.ETH : prices.POL) && (
            <span className="ml-1 text-sm text-gray-500">
              (~ ${" "}
              {(prize * (symbol === "ETH" ? prices.ETH! : prices.POL!)).toFixed(
                2
              )}
              )
            </span>
          )}
      </div>
      {winner && winner !== ethers.ZeroAddress && (
        <div className="truncate">Winner: {winner}</div>
      )}
      {drawing && <div>Drawing...</div>}
      {!winner && !drawing && (
        <button
          className="rounded border px-4 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={buy}
        >
          {t("buyTicket", { price: price.toFixed(4), symbol })}
        </button>
      )}
    </div>
  );
}
