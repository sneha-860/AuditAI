"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ShareAuditError() {
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 text-foreground">
      <Card className="max-w-lg border-white/10 bg-white/[0.04]">
        <CardContent className="p-8 text-center">
          <h1 className="text-3xl font-semibold text-white">This audit link has expired or does not exist.</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">Run your own free audit and get a fresh shareable report.</p>
          <Button asChild className="mt-6 bg-[#00ff88] text-black hover:bg-[#00e67a]">
            <Link href="/">Run your own free audit -&gt;</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
