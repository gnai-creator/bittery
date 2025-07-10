'use client';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import lotteryAbi from '../contracts/Bittery.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

export default function Home() {
  const [provider, setProvider] = useState<ethers.BrowserProvider>();
  const [signer, setSigner] = useState<ethers.JsonRpcSigner>();
  const [players, setPlayers] = useState<string[]>([]);
  const [winner, setWinner] = useState<string>('');
  const [contract, setContract] = useState<ethers.Contract>();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  useEffect(() => {
    if (!provider) return;
    const c = new ethers.Contract(CONTRACT_ADDRESS, lotteryAbi.abi, provider);
    setContract(c);
    getPlayers(c);
    c.on('WinnerPicked', () => getWinner(c));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  async function connect() {
    if ((window as any).ethereum) {
      const prov = new ethers.BrowserProvider((window as any).ethereum);
      await prov.send('eth_requestAccounts', []);
      setProvider(prov);
      setSigner(await prov.getSigner());
    }
  }

  async function buy() {
    if (!contract || !signer) return;
    const tx = await (contract as any).connect(signer).buyTicket({ value: ethers.parseEther('0.01') });
    await tx.wait();
    getPlayers(contract);
  }

  async function getPlayers(c: ethers.Contract) {
    const list: string[] = await c.getPlayers();
    setPlayers(list);
  }

  async function getWinner(c: ethers.Contract) {
    const w: string = await c.recentWinner();
    setWinner(w);
  }

  return (
    <main
      className={`flex flex-col items-center justify-center w-full px-4 py-12 text-center gap-8 ${animate ? 'animate-fade' : ''}`}
    >
      <header className="space-y-2">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Bittery Lottery</h1>
        <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
          Join the decentralized lottery and try your luck!
        </p>
      </header>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          className="rounded bg-black text-white px-6 py-2 hover:bg-gray-800 transition-colors"
          onClick={connect}
        >
          Connect Wallet
        </button>
        <button
          className="rounded border border-gray-800 dark:border-gray-200 px-6 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          onClick={buy}
        >
          Buy Ticket (0.01 ETH)
        </button>
      </div>
      <div className="w-full max-w-md text-left">
        <h2 className="text-xl font-semibold mb-2">Players</h2>
        <ul className="space-y-1">
          {players.map((p) => (
            <li key={p} className="truncate">
              {p}
            </li>
          ))}
        </ul>
      </div>
      {winner && (
        <div>
          <h2 className="text-xl font-semibold">Last Winner</h2>
          <p className="truncate">{winner}</p>
        </div>
      )}
    </main>
  );
}
