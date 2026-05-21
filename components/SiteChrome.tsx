"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const pathname = usePathname();
  const isSharePage = pathname.startsWith("/audit/share/");

  return (
    <header className="sticky top-0 z-40 border-b-[0.5px] border-[#1f1f1f] bg-[#090909]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-6 sm:px-10">
        <Link href="/" className="flex items-center gap-3 text-[16px] font-semibold text-white" aria-label="AuditAI home">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border-[0.5px] border-[#1a4030] bg-[#0d1f18]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#00e87a]" aria-hidden="true" />
          </span>
          <span>AuditAI</span>
        </Link>
        <nav className="flex items-center gap-5" aria-label="Primary navigation">
          {isSharePage ? (
            <Link href="/#spend-form" className="text-[13px] font-medium text-[#00e87a]/75 transition-colors duration-150 hover:text-[#00e87a]">
              Run your free audit &rarr;
            </Link>
          ) : (
            <>
              <Link href="/#how-it-works" className="hidden text-[14px] font-medium text-[#8f8f8f] transition-colors duration-150 hover:text-white sm:inline">
                How it works
              </Link>
              <Link href="/#spend-form" className="rounded-lg bg-[#00e87a] px-5 py-[11px] text-[14px] font-semibold text-black transition-all duration-150 ease-in-out hover:-translate-y-px hover:bg-[#00d470]">
                Run Audit &rarr;
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t-[0.5px] border-[#222] bg-[#080808] px-6 py-7 sm:px-12">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 text-[12px] text-[#444] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[14px] font-medium text-[#ccc]">
            <span className="h-2 w-2 rounded-full bg-[#00e87a]" aria-hidden="true" />
            AuditAI
          </div>
          <p className="mt-1 text-[12px] text-[#555]">AI spend intelligence for startups</p>
        </div>
        <div className="flex gap-6 text-[12px] text-[#666]">
          <Link className="transition-colors duration-150 hover:text-[#999]" href="/#how-it-works">How it works</Link>
          <Link className="transition-colors duration-150 hover:text-[#999]" href="/PRICING_DATA.md">Pricing data</Link>
        </div>
        <p className="max-w-[240px] text-[11px] leading-[1.6]">
          <span className="text-[#555]">Pricing data verified May 4-10, 2026.</span>{" "}
          <span className="text-[#444]">Not affiliated with any AI vendor.</span>
        </p>
      </div>
    </footer>
  );
}
