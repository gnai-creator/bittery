import HistoryView from "../../../components/HistoryView";
import { useTranslations } from "next-intl";

export const metadata = { title: "History" };

export default function MainHistoryPage() {
  const t = useTranslations("common");
  return (
    <main className="flex flex-col items-center gap-4 p-8">
      <h1 className="text-2xl font-bold">{t("historyTitle")}</h1>
      <p className="text-gray-600">{t("historyDescription")}</p>
      <HistoryView network="main" />
    </main>
  );
}
