"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const TERMS_VERSION = "2025-07-10"; // Atualize esta versão quando mudar os termos

export default function TermsBanner() {
  const [accepted, setAccepted] = useState<boolean>(true);
  const t = useTranslations("common");

  useEffect(() => {
    const savedVersion = localStorage.getItem("termsVersionAccepted");
    setAccepted(savedVersion === TERMS_VERSION);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("termsVersionAccepted", TERMS_VERSION);
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div className="fixed bottom-0 w-full bg-black bg-opacity-80 text-white py-4 px-6 z-50">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm">
          {t("agreeTerms")} {" "}
          <a
            href="terms"
            className="underline text-blue-400 hover:text-blue-300 title"
          >
            {t("terms")}
          </a>{" "}
          {t("and") ?? "and"} {" "}
          <a
            href="privacy"
            className="underline text-blue-400 hover:text-blue-300 title"
          >
            {t("privacyPolicy")}
          </a>
          .
        </p>
        <button
          onClick={handleAccept}
          className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-4 py-2 rounded transition-colors"
        >
          {t("accept")}
        </button>
      </div>
    </div>
  );
}
