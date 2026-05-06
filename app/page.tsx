import { ArrowDown } from "lucide-react";
import { SpendForm } from "@/components/SpendForm";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] text-foreground">
      <section className="mx-auto flex min-h-[72vh] w-full max-w-6xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="mb-5 inline-flex rounded-md border border-[#00ff88]/30 bg-[#00ff88]/10 px-3 py-1 text-sm font-semibold text-[#00ff88]">
            Credex AI spend audit
          </p>
          <h1 className="text-5xl font-semibold tracking-normal text-white sm:text-6xl lg:text-7xl">
            Are You Overpaying for AI?
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl">
            Get a free 60-second audit of your AI tool spend. No signup required.
          </p>
          <Button asChild size="lg" className="mt-9 bg-[#00ff88] text-black hover:bg-[#00e67a]">
            <a href="#spend-form">
              Start free audit
              <ArrowDown className="ml-2 h-4 w-4" aria-hidden="true" />
            </a>
          </Button>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <SpendForm />
      </section>
    </main>
  );
}
