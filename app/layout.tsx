import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "AuditAI - AI Spend Audit",
  description: "Free 60-second audit showing where your startup is wasting money on AI subscriptions.",
  metadataBase: new URL("https://credex.rocks"),
  openGraph: {
    title: "AuditAI - Stop Overpaying for AI Tools",
    description: "Free 60-second audit showing exactly where your startup is wasting money on AI subscriptions.",
    type: "website"
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
