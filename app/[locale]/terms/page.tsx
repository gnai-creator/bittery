export const metadata = {
  title: "Terms of Use",
  description: "Terms of service for using the Bitaward platform",
  openGraph: {
    title: "Terms of Use",
    description: "Terms of service for using the Bitaward platform",
    images: ["/Bittery-Logo.png"],
    url: "https://bitaward.net/terms",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Use",
    description: "Terms of service for using the Bitaward platform",
    images: ["/Bittery-Logo.png"],
  },
};
import { Link } from "../../../navigation";
import { useTranslations } from "next-intl";

export default function TermsPage() {
  const t = useTranslations("common");
  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">{t("termsTitle")}</h1>
      <p className="mb-4">
        {t("termsIntro")}
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li>{t("termsBullet1")}</li>
        <li>
          {t("termsBullet2")}
        </li>
        <li>
          {t("termsBullet3")}
        </li>
        <li>{t("termsBullet4")}</li>
        <li>
          {t("termsBullet5")}
        </li>
        <li>
          {t("termsBullet6")}
        </li>
        <li>{t("termsBullet7")}</li>
      </ul>

      <p className="mt-8 text-sm text-gray-500">{t("lastUpdated", { date: "July 10, 2025" })}</p>
      <Link
        href="/"
        className="text-blue-600 hover:underline mt-4 inline-block title"
      >
        {t("backToHome")}
      </Link>
    </main>
  );
}
