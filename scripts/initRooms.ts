import { ethers } from "ethers";
import * as dotenv from "dotenv";
import artifact from "../contracts/Bittery.json";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

type Network = "test" | "main";

function getNetworkConfig(network: Network) {
  const rpcUrl = network === "main" ? process.env.POLYGON_RPC_URL : process.env.SEPOLIA_RPC_URL;
  const contractAddress =
    network === "main"
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

async function initRooms(network: Network) {
  const { contract } = getNetworkConfig(network);
  const next = await contract.nextRoomId();
  const startIndex = Number(next);
  if (startIndex >= rooms.length) {
    console.log(`All rooms already exist on ${network}. Skipping creation.`);
    return;
  }

  for (let i = startIndex; i < rooms.length; i++) {
    const { price, maxPlayers } = rooms[i];
    const tx = await contract.createRoom(ethers.parseEther(price), maxPlayers);
    await tx.wait();
    console.log(
      `Created room #${i} on ${network} with price ${price} ETH and ${maxPlayers} players`
    );
  }
}

Promise.all([initRooms("test"), initRooms("main")]).catch((err) => {
  console.error("Failed to create rooms:", err);
  process.exitCode = 1;
});
