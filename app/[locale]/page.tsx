import type { Metadata } from "next";
import { Link } from "../../navigation";
import { useTranslations } from "next-intl";
import HomeClient from "../components/HomeClient";
export const metadata: Metadata = {
  title: "Home",
  description:
    "Play the Bittery decentralized lottery. Connect your wallet and buy tickets for a chance to win.",
  openGraph: {
    title: "Bittery Lottery",
    description:
      "Play the Bittery decentralized lottery. Connect your wallet and buy tickets for a chance to win.",
    images: ["/Bittery-Logo.png"],
    url: "https://bittery.org/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bittery Lottery",
    description:
      "Play the Bittery decentralized lottery. Connect your wallet and buy tickets for a chance to win.",
    images: ["/Bittery-Logo.png"],
  },
};

export default function Home() {
  const t = useTranslations("common");
  return (
    <main className="flex flex-col items-center gap-4 p-8">
      
      <HomeClient />
    </main>
  );
}
