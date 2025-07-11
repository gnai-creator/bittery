import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const subscriptionIdRaw = process.env.SUBSCRIPTION_ID;
  const coordinatorRaw = process.env.VRF_COORDINATOR;
  const keyHashRaw = process.env.KEY_HASH;
  const feeRecipientRaw = process.env.FEE_RECIPIENT;

  console.log("DEBUG: coordinator:", coordinatorRaw);
  console.log("DEBUG: subscriptionId:", subscriptionIdRaw);
  console.log("DEBUG: keyHash:", keyHashRaw);
  console.log("DEBUG: feeRecipient:", feeRecipientRaw);

  // Verificações de ambiente
  if (
    !subscriptionIdRaw ||
    !coordinatorRaw ||
    !keyHashRaw ||
    !feeRecipientRaw
  ) {
    console.error("❌ Erro: Uma ou mais variáveis de ambiente estão faltando.");
    process.exit(1);
  }

  if (!/^\d+$/.test(subscriptionIdRaw)) {
    console.error("❌ Erro: SUBSCRIPTION_ID deve conter apenas dígitos.");
    process.exit(1);
  }

  let subscriptionId: bigint;
  try {
    subscriptionId = BigInt(subscriptionIdRaw);
  } catch (e) {
    console.error("❌ Erro ao converter SUBSCRIPTION_ID para BigInt:", e);
    process.exit(1);
  }

  // Deploy do contrato com os 4 argumentos
  const Bittery = await ethers.getContractFactory("Bittery");
  const bittery = await Bittery.deploy(
    coordinatorRaw,
    subscriptionId,
    keyHashRaw,
    feeRecipientRaw
  );

  await bittery.waitForDeployment();
  console.log("✅ Bittery deployed to:", bittery.target);
}

main().catch((error) => {
  console.error("❌ Erro durante o deploy:", error);
  process.exitCode = 1;
});
