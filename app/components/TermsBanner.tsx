"use client";

import { useEffect, useState } from "react";

const TERMS_VERSION = "2025-07-10"; // Atualize esta versão quando mudar os termos

export default function TermsBanner() {
  const [accepted, setAccepted] = useState<boolean>(true);

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
          By using this site, you agree to our{" "}
          <a
            href="/terms"
            className="underline text-blue-400 hover:text-blue-300 title"
          >
            Terms
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="underline text-blue-400 hover:text-blue-300 title"
          >
            Privacy Policy
          </a>
          .
        </p>
        <button
          onClick={handleAccept}
          className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-4 py-2 rounded transition-colors"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
