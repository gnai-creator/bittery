// components/Footer.tsx
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("common");
  return (
    <footer className="w-full bg-zinc-900 text-center py-4 border-t border-zinc-800 flex items-center justify-center gap-4">
      <p className="text-sm text-zinc-400">
        {t("allRightsReserved", { year: 2025 })}{" "}
        <span className="font-semibold text-white">{t("bitteryLLC")}</span>
      </p>
      <LanguageSwitcher />
    </footer>
  );
}
