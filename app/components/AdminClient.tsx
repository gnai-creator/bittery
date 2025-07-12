"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import ConnectWalletButton from "./ConnectWalletButton";
import { usePathname } from "../../navigation";
import contractAbi from "../../contracts/Bittery.json";

export default function AdminClient() {
  const [provider, setProvider] = useState<ethers.BrowserProvider>();
  const [signer, setSigner] = useState<ethers.JsonRpcSigner>();
  const [contract, setContract] = useState<ethers.Contract>();
  const [isOwner, setIsOwner] = useState(false);

  // contract parameters
  const [feePercent, setFeePercent] = useState("");
  const [referralPercent, setReferralPercent] = useState("");
  const [feeRecipient, setFeeRecipient] = useState("");
  const [ticketPrice, setTicketPrice] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("");
  const [paymentToken, setPaymentToken] = useState("");
  const [globalRoomId, setGlobalRoomId] = useState("");
  const [refundRoomId, setRefundRoomId] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [paused, setPaused] = useState(false);
  const [winners, setWinners] = useState<string[]>([]);

  const pathname = usePathname();

  useEffect(() => {
    if (!provider) return;
    const address = pathname.includes("/main")
      ? process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MAIN
      : process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_TEST;
    const c = new ethers.Contract(
      address ?? "",
      (contractAbi as any).abi || contractAbi,
      provider
    );
    setContract(c);
  }, [provider, pathname]);

  useEffect(() => {
    if (!contract || !signer) return;
    async function init() {
      if (!contract) return; // Extra check to satisfy TypeScript
      if (!signer) return; // Extra check to satisfy TypeScript
      const owner = await contract.owner();
      const addr = await signer.getAddress();
      if (owner.toLowerCase() === addr.toLowerCase()) {
        setIsOwner(true);
        await refresh();
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, signer]);

  async function refresh() {
    if (!contract) return;
    const fp = await contract.feePercent();
    const rp = await contract.referralPercent();
    const fr = await contract.feeRecipient();
    const pausedState = await contract.paused();
    const ws: string[] = await contract.getWinners();
    setFeePercent(String(Number(fp)));
    setReferralPercent(String(Number(rp)));
    setFeeRecipient(fr);
    setPaused(pausedState);
    setWinners(ws);
  }

  async function tx(fn: string, ...args: any[]) {
    if (!contract || !signer) return;
    const tx = await (contract as any).connect(signer)[fn](...args);
    await tx.wait();
    refresh();
  }

  const updateFeePercent = () => tx("setFeePercent", Number(feePercent));
  const updateReferralPercent = () =>
    tx("setReferralPercent", Number(referralPercent));
  const updateFeeRecipient = () => tx("setFeeRecipient", feeRecipient);
  const createRoom = () =>
    tx(
      "createRoom",
      ethers.parseEther(ticketPrice || "0"),
      Number(maxPlayers),
      paymentToken || ethers.ZeroAddress
    );
  const triggerGlobalDraw = () => tx("triggerGlobalDraw", Number(globalRoomId));
  const refundExpiredRoom = () => tx("refundExpiredRoom", Number(refundRoomId));
  const withdraw = () =>
    tx("adminWithdraw", ethers.parseEther(withdrawAmount || "0"));
  const togglePause = () => tx(paused ? "unpause" : "pause");

  return (
    <main className="flex flex-col items-center gap-6 p-6">
      <ConnectWalletButton
        onConnect={(prov, sig) => {
          setProvider(prov);
          setSigner(sig);
        }}
      />
      {isOwner && (
        <div className="space-y-6 w-full max-w-md">
          <section className="space-y-2">
            <h2 className="font-bold">Contract Parameters</h2>
            <label className="block text-sm">
              Fee Percent – percentage of each prize taken as protocol fee
            </label>
            <input
              type="number"
              className="w-full px-2 py-1 border rounded"
              value={feePercent}
              onChange={(e) => setFeePercent(e.target.value)}
            />
            <button
              onClick={updateFeePercent}
              className="rounded border px-4 py-1 hover:bg-gray-100"
            >
              Update
            </button>

            <label className="block text-sm mt-4">
              Referral Percent – share of the fee sent to the referrer
            </label>
            <input
              type="number"
              className="w-full px-2 py-1 border rounded"
              value={referralPercent}
              onChange={(e) => setReferralPercent(e.target.value)}
            />
            <button
              onClick={updateReferralPercent}
              className="rounded border px-4 py-1 hover:bg-gray-100"
            >
              Update
            </button>

            <label className="block text-sm mt-4">
              Fee Recipient – address that receives collected fees
            </label>
            <input
              type="text"
              className="w-full px-2 py-1 border rounded"
              value={feeRecipient}
              onChange={(e) => setFeeRecipient(e.target.value)}
            />
            <button
              onClick={updateFeeRecipient}
              className="rounded border px-4 py-1 hover:bg-gray-100"
            >
              Update
            </button>
          </section>

          <section className="space-y-2">
            <h2 className="font-bold">Create Room</h2>
            <p className="text-sm text-gray-600">
              Ticket price in native token. Max players defines when the draw
              happens (0 for global). Payment token is the ERC20 address or 0x0
              for native.
            </p>
            <input
              type="text"
              placeholder="Ticket price"
              className="w-full px-2 py-1 border rounded"
              value={ticketPrice}
              onChange={(e) => setTicketPrice(e.target.value)}
            />
            <input
              type="number"
              placeholder="Max players"
              className="w-full px-2 py-1 border rounded"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(e.target.value)}
            />
            <input
              type="text"
              placeholder="Payment token address"
              className="w-full px-2 py-1 border rounded"
              value={paymentToken}
              onChange={(e) => setPaymentToken(e.target.value)}
            />
            <button
              onClick={createRoom}
              className="rounded border px-4 py-1 hover:bg-gray-100"
            >
              Create
            </button>
          </section>

          <section className="space-y-2">
            <h2 className="font-bold">Trigger Global Draw</h2>
            <p className="text-sm text-gray-600">
              Force a draw for a global room
            </p>
            <input
              type="number"
              placeholder="Room id"
              className="w-full px-2 py-1 border rounded"
              value={globalRoomId}
              onChange={(e) => setGlobalRoomId(e.target.value)}
            />
            <button
              onClick={triggerGlobalDraw}
              className="rounded border px-4 py-1 hover:bg-gray-100"
            >
              Trigger
            </button>
          </section>

          <section className="space-y-2">
            <h2 className="font-bold">Refund Expired Room</h2>
            <p className="text-sm text-gray-600">
              Refund all players from an expired room
            </p>
            <input
              type="number"
              placeholder="Room id"
              className="w-full px-2 py-1 border rounded"
              value={refundRoomId}
              onChange={(e) => setRefundRoomId(e.target.value)}
            />
            <button
              onClick={refundExpiredRoom}
              className="rounded border px-4 py-1 hover:bg-gray-100"
            >
              Refund
            </button>
          </section>

          <section className="space-y-2">
            <h2 className="font-bold">Withdraw</h2>
            <p className="text-sm text-gray-600">
              Withdraw leftover funds or referral dust from the contract
            </p>
            <input
              type="text"
              placeholder="Amount"
              className="w-full px-2 py-1 border rounded"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
            <button
              onClick={withdraw}
              className="rounded border px-4 py-1 hover:bg-gray-100"
            >
              Withdraw
            </button>
          </section>

          <section className="space-y-2">
            <h2 className="font-bold">Pause Contract</h2>
            <p className="text-sm text-gray-600">
              Current state: {paused ? "paused" : "active"}
            </p>
            <button
              onClick={togglePause}
              className="rounded border px-4 py-1 hover:bg-gray-100"
            >
              {paused ? "Unpause" : "Pause"}
            </button>
          </section>

          <section className="space-y-2">
            <h2 className="font-bold">Latest Global Winners</h2>
            <ul className="list-disc ml-4 text-sm break-all">
              {winners.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </main>
  );
}
