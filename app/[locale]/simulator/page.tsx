import type { Metadata } from "next";
import SimulatorClient from "../../components/SimulatorClient";

export const metadata: Metadata = {
  title: "Referral Simulator",
  description: "Simulate potential earnings from Bitaward's referral program",
  openGraph: {
    title: "Referral Simulator",
    description: "Simulate potential earnings from Bitaward's referral program",
    images: ["/Bittery-Logo.png"],
    url: "https://bitaward.net/simulator",
  },
  twitter: {
    card: "summary_large_image",
    title: "Referral Simulator",
    description: "Simulate potential earnings from Bitaward's referral program",
    images: ["/Bittery-Logo.png"],
  },
};

export default function SimulatorPage() {
  return <SimulatorClient />;
}
