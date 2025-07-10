export const metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for using the Bittery platform",
  openGraph: {
    title: "Privacy Policy",
    description: "Privacy policy for using the Bittery platform",
    images: ["/Bittery-Logo.png"],
    url: "https://bittery.org/privacy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy",
    description: "Privacy policy for using the Bittery platform",
    images: ["/Bittery-Logo.png"],
  },
};
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">
        At Bittery, we value your privacy. As a decentralized application
        (dApp), we do not collect personal information directly.
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li>We do not store names, emails, or any personal identifiers.</li>
        <li>
          We interact with your Ethereum wallet (e.g., MetaMask) to process
          transactions.
        </li>
        <li>
          Wallet addresses and transaction history are publicly recorded on the
          blockchain.
        </li>
        <li>
          Third-party services (e.g., Chainlink VRF, Alchemy, Cloudflare) may
          collect metadata such as IP addresses.
        </li>
        <li>We may use anonymous analytics to improve site performance.</li>
      </ul>

      <p className="mt-6">
        By using Bittery, you consent to this privacy policy. If you do not
        agree, please disconnect and refrain from using the application.
      </p>

      <p className="mt-8 text-sm text-gray-500">Last updated: July 10, 2025</p>
      <Link
        href="../"
        className="text-blue-600 hover:underline mt-4 inline-block title"
      >
        Back to Home
      </Link>
    </main>
  );
}
