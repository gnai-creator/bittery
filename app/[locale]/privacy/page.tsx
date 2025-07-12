export const metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for using the Bitaward platform",
  openGraph: {
    title: "Privacy Policy",
    description: "Privacy policy for using the Bitaward platform",
    images: ["/Bittery-Logo.png"],
    url: "https://bitaward.net/privacy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy",
    description: "Privacy policy for using the Bitaward platform",
    images: ["/Bittery-Logo.png"],
  },
};
import { Link } from "../../../navigation";
import { useTranslations } from "next-intl";

export default function PrivacyPage() {
  const t = useTranslations("common");
  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">{t("privacyTitle")}</h1>
      <p className="mb-4">
        {t("privacyIntro")}
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li>{t("privacyBullet1")}</li>
        <li>
          {t("privacyBullet2")}
        </li>
        <li>
          {t("privacyBullet3")}
        </li>
        <li>
          {t("privacyBullet4")}
        </li>
        <li>{t("privacyBullet5")}</li>
      </ul>

      <p className="mt-6">
        {t("privacyConclusion")}
      </p>

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
