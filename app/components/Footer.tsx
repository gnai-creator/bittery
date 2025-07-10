// components/Footer.tsx
import LanguageSwitcher from "./LanguageSwitcher";

export default function Footer() {
  return (
    <footer className="w-full bg-zinc-900 text-center py-4 border-t border-zinc-800 flex items-center justify-center gap-4">
      <p className="text-sm text-zinc-400">
        All rights reserved © 2025,{" "}
        <span className="font-semibold text-white">Bittery LLC</span>
      </p>
      <LanguageSwitcher />
    </footer>
  );
}
