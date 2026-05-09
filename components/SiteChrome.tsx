import { Github } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0f0f0f]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold text-white" aria-label="Credex home">
          credex<span className="text-[#00ff88]">.</span>rocks
        </Link>
        <nav className="flex items-center gap-2" aria-label="Primary navigation">
          {githubUrl ? (
            <Button asChild variant="ghost" size="sm" className="hidden border border-white/10 sm:inline-flex">
              <a href={githubUrl} aria-label="Open Credex on GitHub">
                <Github className="mr-2 h-4 w-4" aria-hidden="true" />
                GitHub
              </a>
            </Button>
          ) : null}
          <Button asChild size="sm" className="bg-[#00ff88] text-black hover:bg-[#00e67a]">
            <Link href="/#spend-form">Run Audit</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#0f0f0f] px-4 py-8 text-sm text-zinc-500 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>Pricing data verified May 4-10, 2026.</p>
        <p>Built for Credex. Not affiliated with any AI tool vendor.</p>
      </div>
    </footer>
  );
}
