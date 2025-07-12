import { ethers } from "ethers";
import cron from "node-cron";
import * as dotenv from "dotenv";
import artifact from "../contracts/Bittery.json";
import { Network } from "../lib/contracts";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

function getNetworkConfig(network: Network) {
  const rpcUrl =
    network === "main" ? process.env.POLYGON_RPC_URL : process.env.SEPOLIA_RPC_URL;
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

async function drawForContract(contract: ethers.Contract, network: Network) {
  try {
    const total = Number(await contract.nextRoomId());
    for (let i = 0; i < total; i++) {
      const players: string[] = await contract.getRoomPlayers(i);
      const room = await contract.rooms(i);
      if (
        !room.drawing &&
        room.winner === ethers.ZeroAddress &&
        players.length >= 2
      ) {
        const drawFn =
          (contract as any).draw ?? (contract as any).requestRandomWinner;
        if (typeof drawFn === "function") {
          const tx = await drawFn(i);
          await tx.wait();
          const symbol = network === "main" ? "POL" : "ETH";
          console.log(`Winner request sent for room ${i} on ${network} (${symbol})`, tx.hash);
        } else {
          console.log("No public draw function found on contract");
          break;
        }
      } else {
        console.log(`Skipping room ${i} on ${network}, only ${players.length} player(s)`);
      }
    }
  } catch (err) {
    console.error("Failed to execute draw:", err);
  }
}

async function draw(network: Network) {
  const { contract } = getNetworkConfig(network);
  await drawForContract(contract, network);
}

// Run every Sunday at 20:00
cron.schedule("0 20 * * 0", () => {
  console.log("Running scheduled lottery draw...");
  Promise.all([draw("test"), draw("main")]).catch((err) =>
    console.error("Failed to execute draws:", err)
  );
});
