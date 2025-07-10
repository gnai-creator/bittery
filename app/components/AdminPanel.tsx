"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import contractAbi from "../../contracts/Bittery.json"; // Replace with your ABI if needed

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ""; // Replace with your deployed address

interface Props {
  provider?: ethers.BrowserProvider;
  signer?: ethers.JsonRpcSigner;
}

export default function AdminPanel({ provider, signer }: Props) {
  const [contract, setContract] = useState<ethers.Contract>();
  const [isOwner, setIsOwner] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [feePercent, setFeePercent] = useState("");
  const [referralPercent, setReferralPercent] = useState("");
  const [feeRecipient, setFeeRecipient] = useState("");
  const [currentFeePercent, setCurrentFeePercent] = useState<number>();
  const [currentReferralPercent, setCurrentReferralPercent] = useState<number>();
  const [currentFeeRecipient, setCurrentFeeRecipient] = useState<string>("");

  useEffect(() => {
    if (!provider) return;
    const c = new ethers.Contract(
      CONTRACT_ADDRESS,
      (contractAbi as any).abi || contractAbi,
      provider
    );
    setContract(c);
  }, [provider]);

  useEffect(() => {
    if (!contract || !signer) return;
    const checkOwner = async () => {
      const owner = await contract.owner();
      const addr = await signer.getAddress();
      if (owner.toLowerCase() === addr.toLowerCase()) {
        setIsOwner(true);
        fetchValues();
      }
    };
    const fetchValues = async () => {
      const fp = await contract.feePercent();
      const rp = await contract.referralPercent();
      const fr = await contract.feeRecipient();
      setCurrentFeePercent(Number(fp));
      setCurrentReferralPercent(Number(rp));
      setCurrentFeeRecipient(fr);
      setFeePercent(String(Number(fp)));
      setReferralPercent(String(Number(rp)));
      setFeeRecipient(fr);
    };
    checkOwner();
  }, [contract, signer]);

  const refreshValues = async () => {
    if (!contract) return;
    const fp = await contract.feePercent();
    const rp = await contract.referralPercent();
    const fr = await contract.feeRecipient();
    setCurrentFeePercent(Number(fp));
    setCurrentReferralPercent(Number(rp));
    setCurrentFeeRecipient(fr);
    setFeePercent(String(Number(fp)));
    setReferralPercent(String(Number(rp)));
    setFeeRecipient(fr);
  };

  async function updateFeePercent() {
    if (!contract || !signer) return;
    if (!window.confirm("Confirm updating fee percent?")) return;
    const tx = await contract
      .connect(signer)
      .setFeePercent(Number(feePercent));
    await tx.wait();
    refreshValues();
  }

  async function updateReferralPercent() {
    if (!contract || !signer) return;
    if (!window.confirm("Confirm updating referral percent?")) return;
    const tx = await contract
      .connect(signer)
      .setReferralPercent(Number(referralPercent));
    await tx.wait();
    refreshValues();
  }

  async function updateFeeRecipient() {
    if (!contract || !signer) return;
    if (!window.confirm("Confirm updating fee recipient?")) return;
    const tx = await contract
      .connect(signer)
      .setFeeRecipient(feeRecipient);
    await tx.wait();
    refreshValues();
  }

  if (!isOwner) return null;

  return (
    <div className="space-y-4">
      {!showPanel && (
        <button
          onClick={() => setShowPanel(true)}
          className="rounded border border-gray-800 dark:border-gray-200 px-6 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          Admin Dashboard
        </button>
      )}
      {showPanel && (
        <div className="space-y-6 max-w-md">
          <div className="space-y-1">
            <div>Current feePercent: {currentFeePercent}</div>
            <input
              type="number"
              value={feePercent}
              onChange={(e) => setFeePercent(e.target.value)}
              className="w-full px-2 py-1 border rounded"
              placeholder="Set Fee Percent (0-100)"
            />
            <button
              onClick={updateFeePercent}
              className="rounded border border-gray-800 dark:border-gray-200 px-4 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Confirm
            </button>
          </div>
          <div className="space-y-1">
            <div>Current referralPercent: {currentReferralPercent}</div>
            <input
              type="number"
              value={referralPercent}
              onChange={(e) => setReferralPercent(e.target.value)}
              className="w-full px-2 py-1 border rounded"
              placeholder="Set Referral Percent (0-100)"
            />
            <button
              onClick={updateReferralPercent}
              className="rounded border border-gray-800 dark:border-gray-200 px-4 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Confirm
            </button>
          </div>
          <div className="space-y-1">
            <div>Current feeRecipient: {currentFeeRecipient}</div>
            <input
              type="text"
              value={feeRecipient}
              onChange={(e) => setFeeRecipient(e.target.value)}
              className="w-full px-2 py-1 border rounded"
              placeholder="Set Fee Recipient (address)"
            />
            <button
              onClick={updateFeeRecipient}
              className="rounded border border-gray-800 dark:border-gray-200 px-4 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
