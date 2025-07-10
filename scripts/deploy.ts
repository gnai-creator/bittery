import { ethers } from "hardhat";

async function main() {
  const subscriptionIdRaw = process.env.SUBSCRIPTION_ID; // Mantenha estas variáveis para passar ao construtor
  const coordinatorRaw = process.env.VRF_COORDINATOR;
  const keyHashRaw = process.env.KEY_HASH; // --- Seus logs de debug existentes ---

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
  ); // --- Fim dos logs ---
  if (!subscriptionIdRaw || !coordinatorRaw || !keyHashRaw) {
    // Verifique todos
    console.error(
      "Erro: Uma ou mais variáveis de ambiente VRF estão faltando ou vazias."
    );
    process.exit(1);
  } // Regex para garantir que o SUBSCRIPTION_ID contém apenas dígitos

  const digitsOnly = /^\d+$/;
  if (!digitsOnly.test(subscriptionIdRaw)) {
    console.error(
      "Erro: SUBSCRIPTION_ID deve conter apenas dígitos. Substitua valores de placeholder pelo número real."
    );
    process.exit(1);
  }

  let subscriptionId: bigint;
  try {
    subscriptionId = BigInt(subscriptionIdRaw);
  } catch (e) {
    console.error(
      "Erro ao converter SUBSCRIPTION_ID para BigInt. Verifique se é um número válido.",
      e
    );
    process.exit(1);
  } // --- Logs dos valores convertidos/finalizados que serão passados ---

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
  ); // --- Fim dos logs ---
  const Lottery = await ethers.getContractFactory("Bittery"); // PASSE OS TRÊS ARGUMENTOS AQUI, NA ORDEM CORRETA
  const lottery = await Lottery.deploy(
    coordinatorRaw, // 1º argumento: o endereço do coordenador
    subscriptionId, // 2º argumento: o ID da assinatura (já convertido para BigInt)
    keyHashRaw // 3º argumento: o key hash
  );
  await lottery.waitForDeployment();

  console.log("Lottery deployed to:", lottery.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
