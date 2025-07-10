'use client';
import { useState } from 'react';

interface Slide {
  title: string;
  text: string;
  link?: string;
}

const slides: Slide[] = [
  {
    title: 'How It Works',
    text: 'Each ticket costs 0.01 ETH. When the drawing starts, a random number from Chainlink VRF picks the winner and the entire prize is sent to them.',
  },
  {
    title: 'Rules',
    text: 'Send exactly 0.01 ETH when buying. Only the contract owner can start the drawing and a 5% fee is sent to the configured address.',
  },
  {
    title: 'Technical Details',
    text: 'The Solidity contract uses Chainlink VRF v2 for randomness. The interface was built with Next.js and ethers.js.',
  },
  {
    title: 'Code',
    text: 'The full project is available on GitHub.',
    link: 'https://github.com/yourusername/bittery',
  },
];

export default function InfoCarousel() {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((index + 1) % slides.length);
  const prev = () => setIndex((index - 1 + slides.length) % slides.length);

  const slide = slides[index];

  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-white dark:bg-neutral-900 rounded-lg shadow space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={prev} className="px-2 py-1" aria-label="Previous">
          ‹
        </button>
        <h2 className="text-2xl font-bold">{slide.title}</h2>
        <button onClick={next} className="px-2 py-1" aria-label="Next">
          ›
        </button>
      </div>
      <p className="text-gray-700 dark:text-gray-300 text-left">
        {slide.text}{' '}
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
    </div>
  );
}
