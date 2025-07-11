import { ethers } from "ethers";
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

async function main() {
  const next = await contract.nextRoomId();
  const startIndex = Number(next);
  if (startIndex >= rooms.length) {
    console.log("All rooms already exist. Skipping creation.");
    return;
  }

  for (let i = startIndex; i < rooms.length; i++) {
    const { price, maxPlayers } = rooms[i];
    const tx = await contract.createRoom(ethers.parseEther(price), maxPlayers);
    await tx.wait();
    console.log(`Created room #${i} with price ${price} ETH and ${maxPlayers} players`);
  }
}

main().catch((err) => {
  console.error("Failed to create rooms:", err);
  process.exitCode = 1;
});
