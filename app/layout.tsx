import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "AuditAI — Stop Overpaying for AI Tools",
  description: "Free 60-second audit shows exactly where your startup is wasting money on AI subscriptions.",
  metadataBase: new URL("https://credex-assignment-vercel.vercel.app"),
  openGraph: {
    title: "AuditAI — Stop Overpaying for AI Tools",
    description: "Free 60-second audit shows exactly where your startup is wasting money on AI subscriptions.",
    url: "https://credex-assignment-vercel.vercel.app",
    siteName: "AuditAI",
    images: [
      {
        url: "https://credex-assignment-vercel.vercel.app/api/og",
        width: 1200,
        height: 630,
        alt: "AuditAI — Stop Overpaying for AI Tools"
      }
    ],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "AuditAI — Stop Overpaying for AI Tools",
    description: "Free 60-second audit shows exactly where your startup is wasting money on AI subscriptions.",
    images: ["https://credex-assignment-vercel.vercel.app/api/og"]
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
