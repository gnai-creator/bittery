import artifact from '../contracts/Bittery.json';
const abi = artifact.abi;

export type Network = 'test' | 'main';

export function getContractConfig(network: Network) {
  if (network === 'main') {
    return {
      address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MAIN as `0x${string}`,
      chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID_MAIN || '1'),
      abi,
    } as const;
  }
  return {
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_TEST as `0x${string}`,
    chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID_TEST || '1'),
    abi,
  } as const;
}
