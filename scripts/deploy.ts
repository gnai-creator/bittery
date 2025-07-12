import { ethers, network } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const networkName = network.name;

  const rpcUrl =
    networkName === "sepolia"
      ? process.env.SEPOLIA_RPC_URL
      : process.env.POLYGON_RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;

  if (!rpcUrl || !privateKey) {
    console.error(
      "❌ Erro: RPC_URL e PRIVATE_KEY devem estar definidos nas variáveis de ambiente."
    );
    process.exit(1);
  }

  let coordinatorRaw: string | undefined;
  let subscriptionIdRaw: string | undefined;
  let keyHashRaw: string | undefined;

  // Seleciona as variáveis de acordo com a rede
  if (networkName === "sepolia") {
    coordinatorRaw = process.env.VRF_COORDINATOR_TEST;
    subscriptionIdRaw = process.env.SUBSCRIPTION_ID_TEST;
    keyHashRaw = process.env.KEY_HASH_TEST;
  } else if (networkName === "polygon") {
    coordinatorRaw = process.env.VRF_COORDINATOR_MAIN;
    subscriptionIdRaw = process.env.SUBSCRIPTION_ID_MAIN;
    keyHashRaw = process.env.KEY_HASH_MAIN;
  } else {
    console.error("❌ Rede não suportada:", networkName);
    process.exit(1);
  }

  const feeRecipientRaw = process.env.FEE_RECIPIENT;

  console.log("DEBUG: coordinator:", coordinatorRaw);
  console.log("DEBUG: subscriptionId:", subscriptionIdRaw);
  console.log("DEBUG: keyHash:", keyHashRaw);
  console.log("DEBUG: feeRecipient:", feeRecipientRaw);

  // Verificação das variáveis
  if (
    !coordinatorRaw ||
    !subscriptionIdRaw ||
    !keyHashRaw ||
    !feeRecipientRaw
  ) {
    console.error("❌ Erro: Variáveis de ambiente faltando.");
    process.exit(1);
  }

  if (!/^\d+$/.test(subscriptionIdRaw)) {
    console.error("❌ Erro: SUBSCRIPTION_ID inválido.");
    process.exit(1);
  }

  let subscriptionId: bigint;
  try {
    subscriptionId = BigInt(subscriptionIdRaw);
  } catch (e) {
    console.error("❌ Erro ao converter SUBSCRIPTION_ID para BigInt:", e);
    process.exit(1);
  }

  // Deploy
  const Bittery = await ethers.getContractFactory("Bittery");
  const bittery = await Bittery.deploy(
    coordinatorRaw,
    subscriptionId,
    keyHashRaw,
    feeRecipientRaw
  );

  await bittery.waitForDeployment();
  console.log(`✅ Bittery deployed on [${networkName}] at:`, bittery.target);
}

main().catch((error) => {
  console.error("❌ Erro durante o deploy:", error);
  process.exitCode = 1;
});
