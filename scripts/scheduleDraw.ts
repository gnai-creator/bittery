import { ethers } from "ethers";
import cron from "node-cron";
import * as dotenv from "dotenv";
import lotteryAbi from "../contracts/Bittery.json";

dotenv.config();

const RPC_URL = process.env.POLYGON_RPC_URL || process.env.SEPOLIA_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const CONTRACT_ADDRESS = "0xbfa9A081EDe54008287740EaD6CDE9bc7020f999";

if (!RPC_URL || !PRIVATE_KEY) {
  console.error("RPC_URL and PRIVATE_KEY must be set in the environment");
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const lottery = new ethers.Contract(CONTRACT_ADDRESS, lotteryAbi.abi, wallet);

async function draw() {
  try {
    const players: string[] = await lottery.getPlayers();
    if (players.length >= 2) {
      const tx = await lottery.requestRandomWinner();
      await tx.wait();
      console.log("Winner request sent", tx.hash);
    } else {
      console.log(`Skipping draw, only ${players.length} player(s)`);
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
