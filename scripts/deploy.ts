import { ethers } from "hardhat";

async function main() {
  const coordinatorRaw = process.env.VRF_COORDINATOR;
  const subscriptionIdRaw = process.env.SUBSCRIPTION_ID;
  const keyHashRaw = process.env.KEY_HASH;

  // --- Adicione estes logs para TODOS os argumentos ---
  console.log(
    "DEBUG: coordinator (raw):",
    JSON.stringify(coordinatorRaw),
    "Type:",
    typeof coordinatorRaw
  );
  console.log(
    "DEBUG: subscriptionId (raw):",
    JSON.stringify(subscriptionIdRaw),
    "Type:",
    typeof subscriptionIdRaw
  );
  console.log(
    "DEBUG: keyHash (raw):",
    JSON.stringify(keyHashRaw),
    "Type:",
    typeof keyHashRaw
  );
  // --- Fim dos logs ---

  if (!coordinatorRaw || !subscriptionIdRaw || !keyHashRaw) {
    console.error(
      "Erro: Uma ou mais variáveis de ambiente VRF estão faltando ou vazias."
    );
    process.exit(1);
  }

  // Converta subscriptionId para BigInt de forma robusta
  let subscriptionId: bigint;
  try {
    subscriptionId = BigInt(subscriptionIdRaw);
  } catch (e) {
    console.error(
      "Erro ao converter SUBSCRIPTION_ID para BigInt. Verifique se é um número válido.",
      e
    );
    process.exit(1);
  }

  // --- Logs dos valores convertidos/finalizados que serão passados ---
  console.log(
    "DEBUG: coordinator (final):",
    coordinatorRaw,
    "Type:",
    typeof coordinatorRaw
  );
  console.log(
    "DEBUG: subscriptionId (final):",
    subscriptionId,
    "Type:",
    typeof subscriptionId
  );
  console.log(
    "DEBUG: keyHash (final):",
    keyHashRaw,
    "Type:",
    typeof keyHashRaw
  );
  // --- Fim dos logs ---

  const Lottery = await ethers.getContractFactory("DecentralizedLottery");
  // Passe as variáveis para o deploy
  const lottery = await Lottery.deploy(
    coordinatorRaw,
    subscriptionId,
    keyHashRaw
  );
  await lottery.waitForDeployment();

  console.log("Lottery deployed to:", lottery.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
