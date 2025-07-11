'use client';
import { useState } from 'react';
import { ethers } from 'ethers';
import { useBitteryContract } from '../../hooks/useBitteryContract';
import { Network } from '../../lib/contracts';

interface Props {
  network: Network;
  id: number;
}

export default function RoomCard({ network, id }: Props) {
  const contract = useBitteryContract(network);
  const [players, setPlayers] = useState<string[]>([]);
  const [winner, setWinner] = useState<string>('');
  const [drawing, setDrawing] = useState(false);

  async function refresh() {
    const room = await contract.rooms(id);
    setDrawing(room.drawing);
    setWinner(room.winner);
    const list = await contract.getRoomPlayers(id);
    setPlayers(list);
  }

  async function buy() {
    const provider = contract.runner as ethers.BrowserProvider;
    const signer = await provider.getSigner();
    const room = await contract.rooms(id);
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || ethers.ZeroAddress;
    const tx = await contract.connect(signer).buyTicket(id, ref, {
      value: room.ticketPrice,
    });
    await tx.wait();
    refresh();
    alert('Ticket purchased!');
  }

  return (
    <div className="border rounded p-4 space-y-2 bg-white dark:bg-neutral-900">
      <button onClick={refresh} className="text-sm underline">
        Refresh
      </button>
      <div className="font-semibold">Room #{id}</div>
      <div>Players: {players.length}</div>
      {winner && <div className="truncate">Winner: {winner}</div>}
      {drawing && <div>Drawing...</div>}
      <button
        className="rounded border px-4 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={buy}
      >
        Buy Ticket
      </button>
    </div>
  );
}
