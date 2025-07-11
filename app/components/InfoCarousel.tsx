"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface Slide {
  title: string;
  text: string;
  link?: string;
}


export default function InfoCarousel() {
  const t = useTranslations("common");
  const slides: Slide[] = [
    { title: t("howItWorksTitle"), text: t("howItWorksText") },
    { title: t("rulesTitle"), text: t("rulesText") },
    { title: t("technicalTitle"), text: t("technicalText") },
    { title: t("trustTitle"), text: t("trustText") },
    { title: t("codeTitle"), text: t("codeText"), link: "https://github.com/gnai-creator/bittery" },
  ];

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
        <p className="text-gray-700 dark:text-gray-300 text-left break-words">
          {slide.text}
        </p>
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
