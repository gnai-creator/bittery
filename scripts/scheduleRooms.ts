import { ethers } from "ethers";
import cron from "node-cron";
import * as dotenv from "dotenv";
import artifact from "../contracts/Bittery.json";

dotenv.config();

const RPC_URL = process.env.RPC_URL || process.env.SEPOLIA_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || process.env.CONTRACT_ADDRESS_TEST || "";

if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
  console.error("RPC_URL, PRIVATE_KEY and CONTRACT_ADDRESS must be set in the environment");
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, (artifact as any).abi || artifact, wallet);

interface RoomConfig {
  maxPlayers: number;
  price: string; // in ETH
}

const rooms: RoomConfig[] = [
  { maxPlayers: 10, price: "0.01" },
  { maxPlayers: 10, price: "0.001" },
  { maxPlayers: 10, price: "0.0005" },
  { maxPlayers: 20, price: "0.01" },
  { maxPlayers: 20, price: "0.001" },
  { maxPlayers: 20, price: "0.0005" },
  { maxPlayers: 50, price: "0.01" },
  { maxPlayers: 50, price: "0.001" },
  { maxPlayers: 50, price: "0.0005" },
  { maxPlayers: 100, price: "0.01" },
  { maxPlayers: 100, price: "0.001" },
  { maxPlayers: 100, price: "0.0005" },
  { maxPlayers: 1000, price: "0.01" },
  { maxPlayers: 1000, price: "0.001" },
  { maxPlayers: 1000, price: "0.0005" },
];

async function ensureRooms() {
  const next = await contract.nextRoomId();
  const total = Number(next);

  for (const { price, maxPlayers } of rooms) {
    let latestIndex = -1;

    for (let i = total - 1; i >= 0; i--) {
      const room = await contract.rooms(i);
      if (room.ticketPrice.toString() === ethers.parseEther(price).toString() && room.maxPlayers === BigInt(maxPlayers)) {
        latestIndex = i;
        const roomPlayers: string[] = room.players;
        const finished = room.winner !== ethers.ZeroAddress || room.drawing || roomPlayers.length >= maxPlayers;
        if (finished) {
          const tx = await contract.createRoom(ethers.parseEther(price), maxPlayers);
          await tx.wait();
          console.log(`Created room #${await contract.nextRoomId() - 1n} with price ${price} ETH and ${maxPlayers} players`);
        }
        break;
      }
    }

    if (latestIndex === -1) {
      const tx = await contract.createRoom(ethers.parseEther(price), maxPlayers);
      await tx.wait();
      console.log(`Created initial room with price ${price} ETH and ${maxPlayers} players`);
    }
  }
}

// Check every minute
cron.schedule("* * * * *", () => {
  console.log("Checking rooms...");
  ensureRooms().catch((err) => console.error("Failed to ensure rooms:", err));
});
