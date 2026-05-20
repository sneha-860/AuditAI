import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import "./globals.css";

const productionUrl = "https://auditai.vercel.app";

export const metadata: Metadata = {
  title: "AuditAI - Stop Overpaying for AI Tools",
  description: "Free 60-second audit shows exactly where your startup is wasting money on AI subscriptions.",
  metadataBase: new URL(productionUrl),
  openGraph: {
    title: "AuditAI - Stop Overpaying for AI Tools",
    description: "Free 60-second audit shows exactly where your startup is wasting money on AI subscriptions.",
    url: productionUrl,
    siteName: "AuditAI",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "AuditAI - Stop Overpaying for AI Tools"
      }
    ],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "AuditAI - Stop Overpaying for AI Tools",
    description: "Free 60-second audit shows exactly where your startup is wasting money on AI subscriptions.",
    images: ["/opengraph-image"]
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
