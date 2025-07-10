import type { Metadata } from "next";
import AdminClient from "../../components/AdminClient";

export const metadata: Metadata = {
  title: "Admin",
  description: "Administrative panel for Bittery contract management",
  openGraph: {
    title: "Bittery Admin",
    description: "Administrative panel for Bittery contract management",
    images: ["/Bittery-Logo.png"],
    url: "https://bittery.org/admin",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bittery Admin",
    description: "Administrative panel for Bittery contract management",
    images: ["/Bittery-Logo.png"],
  },
};

export default function AdminPage() {
  return <AdminClient />;
}
