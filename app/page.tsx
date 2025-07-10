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
    <main className="p-8 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Bittery Lottery</h1>
      <button className="border px-3 py-1" onClick={connect}>Connect Wallet</button>
      <button className="border px-3 py-1" onClick={buy}>Buy Ticket (0.01 ETH)</button>
      <div>
        <h2 className="font-semibold">Players:</h2>
        <ul>{players.map((p) => (<li key={p}>{p}</li>))}</ul>
      </div>
      {winner && (
        <div>
          <h2 className="font-semibold">Last Winner:</h2>
          <p>{winner}</p>
        </div>
      )}
    </main>
  );
}
