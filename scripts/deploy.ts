import { ethers } from "hardhat";

async function main() {
  const coordinator = process.env.VRF_COORDINATOR!;
  const subscriptionId = process.env.SUBSCRIPTION_ID!;
  const keyHash = process.env.KEY_HASH!;

  const Lottery = await ethers.getContractFactory("DecentralizedLottery");
  const lottery = await Lottery.deploy(coordinator, subscriptionId, keyHash);
  await lottery.waitForDeployment();

  console.log("Lottery deployed to:", lottery.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
