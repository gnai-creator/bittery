export const metadata = {
  title: "Terms of Use",
  description: "Terms of service for using the Bittery platform",
};
import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Terms of Use</h1>
      <p className="mb-4">
        By using the Bittery platform, you agree to the following terms and
        conditions:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li>You must be at least 18 years old to participate.</li>
        <li>
          All bets are final. No refunds are allowed once a ticket is purchased.
        </li>
        <li>
          The lottery system is decentralized and uses Chainlink VRF for
          randomness.
        </li>
        <li>We do not guarantee earnings. This is a game of chance.</li>
        <li>
          Bittery reserves the right to pause or terminate the contract if abuse
          or exploits are detected.
        </li>
        <li>
          By connecting your wallet, you accept full responsibility for its
          usage and security.
        </li>
        <li>This dApp is experimental. Use at your own risk.</li>
      </ul>

      <p className="mt-8 text-sm text-gray-500">Last updated: July 10, 2025</p>
      <Link
        href="/"
        className="text-blue-600 hover:underline mt-4 inline-block title"
      >
        Back to Home
      </Link>
    </main>
  );
}
