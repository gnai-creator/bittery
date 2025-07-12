import type { Metadata } from "next";
import AdminClient from "../../components/AdminClient";

export const metadata: Metadata = {
  title: "Admin",
  description: "Administrative panel for Bitaward contract management",
  openGraph: {
    title: "Bitaward Admin",
    description: "Administrative panel for Bitaward contract management",
    images: ["/Bittery-Logo.png"],
    url: "https://bitaward.net/admin",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bitaward Admin",
    description: "Administrative panel for Bitaward contract management",
    images: ["/Bittery-Logo.png"],
  },
};

export default function AdminPage() {
  return <AdminClient />;
}
