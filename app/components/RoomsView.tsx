"use client";
import { useEffect, useState } from "react";
import { useBitteryContract } from "../../hooks/useBitteryContract";
import { Network } from "../../lib/contracts";
import RoomCard from "./RoomCard";

export default function RoomsView({ network }: { network: Network }) {
  const contract = useBitteryContract(network);
  const [groups, setGroups] = useState<Record<number, number[]>>({});

  useEffect(() => {
    async function load() {
      try {
        let next = 0;
        try {
          next = Number(await contract.getNextRoomId());
        } catch (err: any) {
          if (err.code === "BAD_DATA") {
            setGroups({});
            return;
          }
          throw err;
        }
        if (next === 0) {
          setGroups({});
          return;
        }
        const BATCH_SIZE = 3;
        const rooms: any[] = [];
        for (let i = 0; i < next; i += BATCH_SIZE) {
          const batch = Array.from(
            { length: Math.min(BATCH_SIZE, next - i) },
            (_, j) => contract.rooms(i + j)
          );
          rooms.push(...(await Promise.all(batch)));
        }
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
        <div key={max} className="space-y-2 justify-center text-center">
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
