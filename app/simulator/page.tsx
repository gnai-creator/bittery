import type { Metadata } from "next";
import SimulatorClient from "../components/SimulatorClient";

export const metadata: Metadata = {
  title: "Referral Simulator",
  description: "Simulate potential earnings from Bittery's referral program",
  openGraph: {
    title: "Referral Simulator",
    description: "Simulate potential earnings from Bittery's referral program",
    images: ["/Bittery-Logo.png"],
    url: "https://bittery.org/simulator",
  },
  twitter: {
    card: "summary_large_image",
    title: "Referral Simulator",
    description: "Simulate potential earnings from Bittery's referral program",
    images: ["/Bittery-Logo.png"],
  },
};

export default function SimulatorPage() {
  return <SimulatorClient />;
}
