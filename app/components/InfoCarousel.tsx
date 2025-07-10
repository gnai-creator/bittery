'use client';
import { useState } from 'react';

interface Slide {
  title: string;
  text: string;
  link?: string;
}

const slides: Slide[] = [
  {
    title: 'Como funciona',
    text: 'Cada bilhete custa 0.01 ETH. Quando o sorteio é iniciado, um número aleatório da Chainlink VRF define o vencedor e todo o prêmio é enviado para ele.',
  },
  {
    title: 'Regras',
    text: 'Envie exatamente 0.01 ETH ao comprar. Somente o dono do contrato pode iniciar o sorteio e existe uma taxa de 5% destinada ao endereço configurado.',
  },
  {
    title: 'Técnicas',
    text: 'O contrato em Solidity utiliza o Chainlink VRF v2 para aleatoriedade. A interface foi criada com Next.js e ethers.js.',
  },
  {
    title: 'Código',
    text: 'O projeto completo está disponível no GitHub.',
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
        <button onClick={prev} className="px-2 py-1" aria-label="Anterior">
          ‹
        </button>
        <h2 className="text-2xl font-bold">{slide.title}</h2>
        <button onClick={next} className="px-2 py-1" aria-label="Próximo">
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
