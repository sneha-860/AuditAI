import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { getSiteOrigin } from "@/lib/siteUrl";
import "./globals.css";

const siteOrigin = getSiteOrigin();
const title = "AuditAI - Stop Overpaying for AI Tools";
const description = "Free 60-second audit shows exactly where your startup is wasting money on AI subscriptions.";
const ogImageUrl = `${siteOrigin}/opengraph-image`;

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL(siteOrigin),
  openGraph: {
    title,
    description,
    url: siteOrigin,
    siteName: "AuditAI",
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: title
      }
    ],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImageUrl]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[#00e87a] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-black"
        >
          Skip to main content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
