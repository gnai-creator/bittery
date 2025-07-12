import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import TermsBanner from "../components/TermsBanner";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import NetworksClient from "../components/NetworksClient";
import "../globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import WagmiProviders from "../components/WagmiProviders";

import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale, getMessages } from "next-intl/server";
import { locales } from "../../i18n";
import { notFound } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bitaward.net"),
  title: {
    default: "Bitaward",
    template: "%s | Bitaward",
  },
  description: "Decentralized lottery game",
  openGraph: {
    title: "Bitaward",
    description: "Decentralized lottery game",
    url: "https://bitaward.net",
    siteName: "Bitaward",
    images: ["/Bittery-Logo.png"],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bitaward",
    description: "Decentralized lottery game",
    images: ["/Bittery-Logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params }: any) {
  const { locale } = await params;
  if (!locales.includes(locale as any)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-white to-gray-100 dark:from-neutral-900 dark:to-neutral-800 text-gray-900 dark:text-gray-100 flex flex-col min-h-screen`}
      >
        <WagmiProviders>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <Navbar />
            <NetworksClient />
            <main className="flex-grow">{children}</main>
            <Footer />
            <TermsBanner />
          </NextIntlClientProvider>
        </WagmiProviders>
      </body>
    </html>
  );
}
