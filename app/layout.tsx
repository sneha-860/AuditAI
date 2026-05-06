import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Credex AI Spend Audit",
  description: "A free 60-second audit for startup AI tool spend."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
