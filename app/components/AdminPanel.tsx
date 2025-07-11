"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useTranslations } from "next-intl";
import contractAbi from "../../contracts/Bittery.json"; // Replace with your ABI if needed

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ""; // Replace with your deployed address

interface Props {
  provider?: ethers.BrowserProvider;
  signer?: ethers.JsonRpcSigner;
}

export default function AdminPanel({ provider, signer }: Props) {
  const t = useTranslations("common");
  const [contract, setContract] = useState<ethers.Contract>();
  const [isOwner, setIsOwner] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [feePercent, setFeePercent] = useState("");
  const [referralPercent, setReferralPercent] = useState("");
  const [feeRecipient, setFeeRecipient] = useState("");
  const [currentFeePercent, setCurrentFeePercent] = useState<number>(0);
  const [currentReferralPercent, setCurrentReferralPercent] = useState<number>(0);
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
    if (!window.confirm(t("confirmUpdateFeePercent"))) return;
    const tx = await contract
      .connect(signer)
      .getFunction("setFeePercent")(Number(feePercent));
    await tx.wait();
    refreshValues();
  }

  async function updateReferralPercent() {
    if (!contract || !signer) return;
    if (!window.confirm(t("confirmUpdateReferralPercent"))) return;
    const tx = await contract
      .connect(signer)
      .getFunction("setReferralPercent")(Number(referralPercent));
    await tx.wait();
    refreshValues();
  }

  async function updateFeeRecipient() {
    if (!contract || !signer) return;
    if (!window.confirm(t("confirmUpdateFeeRecipient"))) return;
    const tx = await contract
      .connect(signer)
      .getFunction("setFeeRecipient")(feeRecipient);
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
          {t("adminDashboard")}
        </button>
      )}
      {showPanel && (
        <div className="space-y-6 max-w-md">
          <div className="space-y-1">
            <div>{t("currentFeePercent", { value: currentFeePercent })}</div>
            <input
              type="number"
              value={feePercent}
              onChange={(e) => setFeePercent(e.target.value)}
              className="w-full px-2 py-1 border rounded"
              placeholder={t("setFeePercentPlaceholder")}
            />
            <button
              onClick={updateFeePercent}
              className="rounded border border-gray-800 dark:border-gray-200 px-4 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {t("confirm")}
            </button>
          </div>
          <div className="space-y-1">
            <div>{t("currentReferralPercent", { value: currentReferralPercent })}</div>
            <input
              type="number"
              value={referralPercent}
              onChange={(e) => setReferralPercent(e.target.value)}
              className="w-full px-2 py-1 border rounded"
              placeholder={t("setReferralPercentPlaceholder")}
            />
            <button
              onClick={updateReferralPercent}
              className="rounded border border-gray-800 dark:border-gray-200 px-4 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {t("confirm")}
            </button>
          </div>
          <div className="space-y-1">
            <div>{t("currentFeeRecipient", { value: currentFeeRecipient })}</div>
            <input
              type="text"
              value={feeRecipient}
              onChange={(e) => setFeeRecipient(e.target.value)}
              className="w-full px-2 py-1 border rounded"
              placeholder={t("setFeeRecipientPlaceholder")}
            />
            <button
              onClick={updateFeeRecipient}
              className="rounded border border-gray-800 dark:border-gray-200 px-4 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {t("confirm")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
