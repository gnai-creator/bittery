import { ethers } from "ethers";
import cron from "node-cron";
import * as dotenv from "dotenv";
import lotteryAbi from "../contracts/Bittery.json";

dotenv.config();

const RPC_URL =
  process.env.POLYGON_RPC_URL || process.env.SEPOLIA_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MAIN ||
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_TEST ||
  "";

if (!RPC_URL || !PRIVATE_KEY) {
  console.error("RPC_URL and PRIVATE_KEY must be set in the environment");
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const lottery = new ethers.Contract(CONTRACT_ADDRESS, lotteryAbi.abi, wallet);

async function draw() {
  try {
    const total = Number(await lottery.nextRoomId());
    for (let i = 0; i < total; i++) {
      const players: string[] = await lottery.getRoomPlayers(i);
      const room = await lottery.rooms(i);
      if (
        !room.drawing &&
        room.winner === ethers.ZeroAddress &&
        players.length >= 2
      ) {
        const drawFn =
          (lottery as any).draw ?? (lottery as any).requestRandomWinner;
        if (typeof drawFn === "function") {
          const tx = await drawFn(i);
          await tx.wait();
          console.log(`Winner request sent for room ${i}`, tx.hash);
        } else {
          console.log("No public draw function found on contract");
          break;
        }
      } else {
        console.log(`Skipping room ${i}, only ${players.length} player(s)`);
      }
    }
  } catch (err) {
    console.error("Failed to execute draw:", err);
  }
}

// Run every Sunday at 20:00
cron.schedule("0 20 * * 0", () => {
  console.log("Running scheduled lottery draw...");
  draw();
});
