'use client';
import { useEffect, useState } from 'react';
import { useBitteryContract } from '../../hooks/useBitteryContract';
import { Network } from '../../lib/contracts';
import RoomCard from './RoomCard';

export default function RoomsView({ network }: { network: Network }) {
  const contract = useBitteryContract(network);
  const [groups, setGroups] = useState<Record<number, number[]>>({});

  useEffect(() => {
    async function load() {
      try {
        const next = Number(await contract.nextRoomId());
        const rooms = await Promise.all(
          Array.from({ length: next }, (_, i) => contract.rooms(i))
        );
        const mapping: Record<number, number[]> = {};
        rooms.forEach((room: any) => {
          const max = Number(room.maxPlayers);
          if (!mapping[max]) mapping[max] = [];
          mapping[max].push(Number(room.id));
        });
        setGroups(mapping);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [contract]);

  const sorted = Object.entries(groups).sort(
    ([a], [b]) => Number(a) - Number(b)
  );

  return (
    <div className="space-y-8">
      {sorted.map(([max, ids]) => (
        <div key={max} className="space-y-2">
          <h2 className="text-xl font-bold">{max} Player Rooms</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {ids.map((id) => (
              <RoomCard key={id} network={network} id={id} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
