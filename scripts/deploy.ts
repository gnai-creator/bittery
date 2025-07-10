import { ethers } from "hardhat";

async function main() {
  const subscriptionIdRaw = process.env.SUBSCRIPTION_ID;
  const coordinatorRaw = process.env.VRF_COORDINATOR; // Mantenha para log, mas não será passado ao deploy
  const keyHashRaw = process.env.KEY_HASH; // Mantenha para log, mas não será passado ao deploy

  // --- Seus logs de debug existentes ---
  console.log("DEBUG: coordinator (raw):", JSON.stringify(coordinatorRaw), "Type:", typeof coordinatorRaw);
  console.log("DEBUG: subscriptionId (raw):", JSON.stringify(subscriptionIdRaw), "Type:", typeof subscriptionIdRaw);
  console.log("DEBUG: keyHash (raw):", JSON.stringify(keyHashRaw), "Type:", typeof keyHashRaw);
  // --- Fim dos logs ---

  if (!subscriptionIdRaw) {
      console.error("Erro: SUBSCRIPTION_ID está faltando ou vazio.");
      process.exit(1);
  }

  // Regex para garantir que o SUBSCRIPTION_ID contém apenas dígitos
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
  }

  // --- REMOVA OU COMENTE ESTE BLOCO DE VERIFICAÇÃO uint64 ---
  // const MAX_UINT64 = (1n << 64n) - 1n;
  // if (subscriptionId < 0n || subscriptionId > MAX_UINT64) {
  //   console.error(
  //     `Erro: SUBSCRIPTION_ID fora do intervalo uint64 (0-${MAX_UINT64}).`
  //   );
  //   process.exit(1);
  // }
  // --- FIM DO BLOCO A REMOVER/COMENTAR ---

  // --- Logs dos valores convertidos/finalizados que serão passados ---
  console.log(
    "DEBUG: subscriptionId (final):",
    subscriptionId,
    "Type:",
    typeof subscriptionId
  );
  // --- Fim dos logs ---

  const Lottery = await ethers.getContractFactory("Bittery");
  const lottery = await Lottery.deploy(subscriptionId); // Passando apenas o subscriptionId
  await lottery.waitForDeployment();

  console.log("Lottery deployed to:", lottery.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});