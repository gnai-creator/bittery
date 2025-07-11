'use client';
import { useEffect, useState } from 'react';
import { useBitteryContract } from '../../hooks/useBitteryContract';
import { Network } from '../../lib/contracts';
import RoomCard from './RoomCard';

export default function RoomsView({ network }: { network: Network }) {
  const contract = useBitteryContract(network);
  const [ids, setIds] = useState<number[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const next = Number(await contract.nextRoomId());
        setIds(Array.from({ length: next }, (_, i) => i));
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [contract]);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {ids.map((id) => (
        <RoomCard key={id} network={network} id={id} />
      ))}
    </div>
  );
}
