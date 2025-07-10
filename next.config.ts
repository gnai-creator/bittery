import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  i18n: {
    locales: ["en", "pt", "es", "fr", "sv", "de", "ru"],
    defaultLocale: "en",
  },
};

export default nextConfig;
