"use client";

import Link from "next/link";
import { Link2Off } from "lucide-react";

export default function ShareAuditError() {
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6 py-20 text-white">
      <section className="max-w-md text-center">
        <Link2Off className="mx-auto mb-5 h-12 w-12 text-[#444]" aria-hidden="true" />
        <h1 className="text-[18px] font-medium text-white">Audit not found</h1>
        <p className="mt-3 text-[14px] text-[#888]">This link may have expired or doesn&apos;t exist.</p>
        <Link href="/" className="mt-6 inline-flex rounded-lg bg-[#00e87a] px-5 py-3 text-[13px] font-semibold text-black">
          Run your own free audit &rarr;
        </Link>
      </section>
    </main>
  );
}
