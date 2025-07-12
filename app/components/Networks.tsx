"use client";
import { Link, usePathname } from "../../navigation";
import { Network } from "../../lib/contracts";
export default function Networks() {
  const pathname = usePathname();
  const network: Network = pathname.includes("/main") ? "main" : "test";

  return (
    <div className="text-sm text-white-400">
      <div className="flex-1 flex justify-center gap-2">
        <Link
          href="/main"
          className={`px-4 py-1 rounded text-sm ${
            network === "main" ? "bg-orange-600" : "bg-orange-500"
          } hover:bg-orange-700`}
        >
          Mainnet
        </Link>
        <Link
          href="/test"
          className={`px-4 py-1 rounded text-sm ${
            network === "test" ? "bg-orange-600" : "bg-orange-500"
          } hover:bg-orange-700`}
        >
          Testnet
        </Link>
      </div>
    </div>
  );
}
