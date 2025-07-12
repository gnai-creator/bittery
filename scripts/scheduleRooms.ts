import { ethers } from "ethers";
import cron from "node-cron";
import * as dotenv from "dotenv";
import artifact from "../contracts/Bittery.json";
import { Network } from "../lib/contracts";
import { getRooms, RoomConfig } from "../lib/rooms";

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

async function ensureRoomsForContract(
  contract: ethers.Contract,
  rooms: RoomConfig[],
  network: Network
) {
  const next = await contract.getNextRoomId();
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
          const symbol = network === "main" ? "POL" : "ETH";
          console.log(
            `Created room #${
              (await contract.getNextRoomId()) - 1n
            } with price ${price} ${symbol} and ${maxPlayers} players`
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
      const symbol = network === "main" ? "POL" : "ETH";
      console.log(
        `Created initial room with price ${price} ${symbol} and ${maxPlayers} players`
      );
    }
  }
}

async function ensureRooms(network: Network) {
  const { contract } = getNetworkConfig(network);
  const rooms = await getRooms(network);
  await ensureRoomsForContract(contract, rooms, network);
}

// Check every minute
cron.schedule("* * * * *", () => {
  console.log("Checking rooms...");
  Promise.all([ensureRooms("test"), ensureRooms("main")]).catch((err) =>
    console.error("Failed to ensure rooms:", err)
  );
});
