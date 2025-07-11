import artifact from '../contracts/Bittery.json';
import { isAddress } from 'ethers';

const abi = artifact.abi;


export type Network = 'test' | 'main';

export function getContractConfig(network: Network) {
  const address =
    network === 'main'
      ? process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MAIN
      : process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_TEST;

  const chainId =
    network === 'main'
      ? Number(process.env.NEXT_PUBLIC_CHAIN_ID_MAIN || '137')
      : Number(process.env.NEXT_PUBLIC_CHAIN_ID_TEST || '11155111');

  if (!address) {
    throw new Error(`Contract address not configured for network: ${network}`);
  }

  if (!isAddress(address)) {
    throw new Error(`Invalid contract address for network ${network}: ${address}`);
  }

  return {
    address: address as `0x${string}`,
    chainId,
    abi,
  } as const;
}
