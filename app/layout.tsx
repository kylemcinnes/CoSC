import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter } from "next/font/google";

import { PwaRegister } from "@/components/pwa-register";
import { Providers } from "@/app/providers";
import { SITE_NAME, SITE_TAGLINE, getSiteUrl } from "@/lib/site";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const siteUrl = getSiteUrl();
const defaultTitle = "Church of Second Chances | GTA | Second Chances Through Christ";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_TAGLINE,
  applicationName: "Second Chances",
  alternates: { canonical: siteUrl },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: siteUrl,
    siteName: SITE_NAME,
    title: defaultTitle,
    description: SITE_TAGLINE,
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: SITE_TAGLINE,
  },
  appleWebApp: {
    capable: true,
    title: "Second Chances",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a2540",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-CA" className={`${inter.variable} ${geistMono.variable} h-full scroll-smooth`}>
      <body className="min-h-full bg-background font-sans text-foreground antialiased">
        <Providers>
          {children}
          <PwaRegister />
        </Providers>
      </body>
    </html>
  );
}
