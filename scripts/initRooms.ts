import { ethers } from "ethers";
import * as dotenv from "dotenv";
import artifact from "../contracts/Bittery.json";
import { Network } from "../lib/contracts";
import { getRooms } from "../lib/rooms";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

function getNetworkConfig(network: Network) {
  const rpcUrl =
    network === "main"
      ? process.env.POLYGON_RPC_URL
      : process.env.SEPOLIA_RPC_URL;
  const contractAddress =
    network === "main"
      ? process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MAIN
      : process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_TEST;

  if (!rpcUrl || !contractAddress || !PRIVATE_KEY) {
    throw new Error(`Missing env vars for ${network}`);
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(
    contractAddress,
    (artifact as any).abi || artifact,
    wallet
  );

  return { contract };
}

async function initRooms(network: Network) {
  const { contract } = getNetworkConfig(network);
  const rooms = await getRooms(network);
  const next = await contract.getNextRoomId();

  const startIndex = Number(next);
  if (startIndex >= rooms.length) {
    console.log(`All rooms already exist on ${network}. Skipping creation.`);
    return;
  }

  for (let i = startIndex; i < rooms.length; i++) {
    const { price, maxPlayers } = rooms[i];
    const tx = await contract.createRoom(ethers.parseEther(price), maxPlayers);
    await tx.wait();
    const symbol = network === "main" ? "POL" : "ETH";
    console.log(
      `Created room #${i} on ${network} with price ${price} ${symbol} and ${maxPlayers} players`
    );
  }
}

Promise.all([initRooms("test"), initRooms("main")]).catch((err) => {
  console.error("Failed to create rooms:", err);
  process.exitCode = 1;
});
