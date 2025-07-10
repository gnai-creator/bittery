"use client";
import { useState, useEffect } from "react";

interface Slide {
  title: string;
  text: string;
  link?: string;
}

const slides: Slide[] = [
  {
    title: "How It Works",
    text: "Each ticket costs 0.01 ETH. \nWhen two players join, \nthe contract triggers a draw \nevery Sunday at 8 PM, \nor the owner can trigger it manually. \nA random winner is selected \nusing Chainlink VRF, \nand the full prize (minus fee) \nis sent to them.",
  },
  {
    title: "Rules",
    text: `• Each ticket: 0.01 ETH\n
• Always a winner\n
• Auto-draw: all Sundays \nat 8 PM (if ≥ 2 players)\n
• Manual draw: by contract owner\n
• Chainlink VRF rotates \nthe participant index\n
• Winner gets the prize; \n5% goes to fee address`,
  },
  {
    title: "Technical Details",
    text: "Smart contract written in Solidity, \nusing Chainlink VRF v2 \nfor verifiable randomness. \nDeployed on the Polygon Mumbai testnet. \nFrontend built with Next.js and ethers.js.",
  },
  {
    title: "Trust & Transparency",
    text: "All draws are provably fair \nusing Chainlink VRF. \nAll transactions, \nall draws, and winners \nare permanently stored on-chain. \nNo middlemen, no manipulation.",
  },
  {
    title: "Code",
    text: "The full project is open source \nand available on GitHub. \nContributions are welcome!",
    link: "https://github.com/gnai-creator/bittery",
  },
];

export default function InfoCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 12000);
    return () => clearInterval(id);
  }, []);

  const next = () => setIndex((index + 1) % slides.length);
  const prev = () => setIndex((index - 1 + slides.length) % slides.length);

  const slide = slides[index];

  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-white dark:bg-neutral-900 rounded-lg shadow space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={prev} className="px-2 py-1" aria-label="Previous">
          ‹
        </button>
        <h2 className="text-2xl font-bold title">{slide.title}</h2>
        <button onClick={next} className="px-2 py-1" aria-label="Next">
          ›
        </button>
      </div>
      <pre>
        <p className="text-gray-700 dark:text-gray-300 text-left">
          {slide.text}
        </p>
      </pre>
      <p className="text-gray-600 dark:text-gray-400 text-sm">
        {slide.link && (
          <a
            href={slide.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 underline"
          >
            GitHub
          </a>
        )}
      </p>
      <div className="flex items-center justify-center gap-2 pt-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full ${
              i === index
                ? "bg-black dark:bg-white"
                : "bg-gray-400 dark:bg-gray-600"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
