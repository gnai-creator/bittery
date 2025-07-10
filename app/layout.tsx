import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import TermsBanner from "./components/TermsBanner";
import Footer from "./components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bittery.org"),
  title: {
    default: "Bittery",
    template: "%s | Bittery",
  },
  description: "Decentralized lottery game",
  openGraph: {
    title: "Bittery",
    description: "Decentralized lottery game",
    url: "https://bittery.org",
    siteName: "Bittery",
    images: ["/Bittery-Logo.png"],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bittery",
    description: "Decentralized lottery game",
    images: ["/Bittery-Logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-white to-gray-100 dark:from-neutral-900 dark:to-neutral-800 text-gray-900 dark:text-gray-100 flex flex-col min-h-screen`}
      >
        <main className="flex-grow">{children}</main>
        <Footer />
        <TermsBanner />
      </body>
    </html>
  );
}
