'use client';
import { useMemo } from 'react';
import { ethers } from 'ethers';
import { useWalletClient, usePublicClient } from 'wagmi';
import { getContractConfig, Network } from '../lib/contracts';

export function useBitteryContract(network: Network) {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient({ chainId: getContractConfig(network).chainId });

  return useMemo(() => {
    const { address, abi } = getContractConfig(network);
    if (walletClient && typeof window !== 'undefined' && (window as any).ethereum) {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      return new ethers.Contract(address, abi, provider);
    }
    const rpc = publicClient?.transport?.url;
    const provider = new ethers.JsonRpcProvider(rpc);
    return new ethers.Contract(address, abi, provider);
  }, [walletClient, publicClient, network]);
}
