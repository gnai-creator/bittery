import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import artifact from '../../../contracts/Bittery.json';

export const runtime = 'nodejs';

const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

type Network = 'test' | 'main';

function getNetworkConfig(network: Network) {
  const rpcUrl =
    network === 'main'
      ? process.env.POLYGON_RPC_URL
      : process.env.SEPOLIA_RPC_URL;
  const contractAddress =
    network === 'main'
      ? process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MAIN
      : process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_TEST;

  if (!rpcUrl || !contractAddress || !PRIVATE_KEY) {
    throw new Error(`Missing env vars for ${network}`);
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(contractAddress, (artifact as any).abi || artifact, wallet);

  return { contract };
}

interface RoomConfig {
  maxPlayers: number;
  price: string; // in ETH
}

const rooms: RoomConfig[] = [
  { maxPlayers: 10, price: '0.01' },
  { maxPlayers: 10, price: '0.001' },
  { maxPlayers: 10, price: '0.0005' },
  { maxPlayers: 20, price: '0.01' },
  { maxPlayers: 20, price: '0.001' },
  { maxPlayers: 20, price: '0.0005' },
  { maxPlayers: 50, price: '0.01' },
  { maxPlayers: 50, price: '0.001' },
  { maxPlayers: 50, price: '0.0005' },
  { maxPlayers: 100, price: '0.01' },
  { maxPlayers: 100, price: '0.001' },
  { maxPlayers: 100, price: '0.0005' },
  { maxPlayers: 1000, price: '0.01' },
  { maxPlayers: 1000, price: '0.001' },
  { maxPlayers: 1000, price: '0.0005' },
];

async function ensureRoomsForContract(contract: ethers.Contract) {
  const next = await contract.nextRoomId();
  const total = Number(next);

  for (const { price, maxPlayers } of rooms) {
    let latestIndex = -1;

    for (let i = total - 1; i >= 0; i--) {
      const room = await contract.rooms(i);
      if (
        room.ticketPrice.toString() === ethers.parseEther(price).toString() &&
        room.maxPlayers === BigInt(maxPlayers)
      ) {
        latestIndex = i;
        const roomPlayers: string[] = room.players;
        const finished =
          room.winner !== ethers.ZeroAddress ||
          room.drawing ||
          roomPlayers.length >= maxPlayers;
        if (finished) {
          const tx = await contract.createRoom(
            ethers.parseEther(price),
            maxPlayers
          );
          await tx.wait();
          console.log(
            `Created room #${(await contract.nextRoomId()) - 1n} with price ${price} ETH and ${maxPlayers} players`
          );
        }
        break;
      }
    }

    if (latestIndex === -1) {
      const tx = await contract.createRoom(
        ethers.parseEther(price),
        maxPlayers
      );
      await tx.wait();
      console.log(`Created initial room with price ${price} ETH and ${maxPlayers} players`);
    }
  }
}

async function ensureRooms(network: Network) {
  const { contract } = getNetworkConfig(network);
  await ensureRoomsForContract(contract);
}

export async function GET() {
  try {
    await Promise.all([ensureRooms('test'), ensureRooms('main')]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to ensure rooms:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
