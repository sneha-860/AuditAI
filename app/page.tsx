import { ArrowDown, BarChart3, ClipboardList, Share2 } from "lucide-react";
import { SpendForm } from "@/components/SpendForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const HOW_IT_WORKS = [
  {
    title: "Enter your AI tools",
    body: "Pick the products, plans, and seats you already pay for.",
    meta: "30 seconds",
    icon: ClipboardList
  },
  {
    title: "Get instant analysis",
    body: "See plan mismatches, overlap, and credit opportunities before signup.",
    meta: "no signup",
    icon: BarChart3
  },
  {
    title: "Save money, share your audit",
    body: "Send the report to finance, ops, or your team in one clean link.",
    meta: "shareable",
    icon: Share2
  }
];

const FAQS = [
  {
    question: "Is this really free?",
    answer: "Yes. You can run the audit and see savings before entering an email."
  },
  {
    question: "What tools does Credex audit?",
    answer: "The audit covers common AI subscriptions and API spend across coding, assistant, workspace, and model-provider tools."
  },
  {
    question: "How accurate are the savings estimates?",
    answer: "Savings are deterministic estimates based on current plan prices, seat counts, overlap, and practical procurement rules."
  },
  {
    question: "Do you store private company data?",
    answer: "Shared public pages only expose the audit report. Lead details like email, company, and role are never rendered there."
  },
  {
    question: "Is Credex affiliated with these AI vendors?",
    answer: "No. Credex is independent and not affiliated with any AI tool vendor."
  }
];

export default function LandingPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#0f0f0f] text-foreground">
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

      <section className="border-y border-white/10 bg-white/[0.03] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl text-center text-sm font-semibold text-zinc-300">
          {/* Mocked social proof until live analytics and savings totals are connected. */}
          847 audits run · $2.3M in savings identified
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#00ff88]">How it works</p>
          <h2 className="text-3xl font-semibold text-white">From messy spend to a finance-ready audit.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {HOW_IT_WORKS.map((step, index) => {
            const Icon = step.icon;

            return (
              <Card key={step.title} className="border-white/10 bg-white/[0.04]">
                <CardContent className="p-5">
                  <div className="mb-6 flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#00ff88]/15 text-[#00ff88]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="text-sm text-zinc-500">0{index + 1}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{step.body}</p>
                  <p className="mt-4 text-sm font-semibold text-[#00ff88]">{step.meta}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <SpendForm />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#00ff88]">FAQ</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Common questions</h2>
        </div>
        <div className="grid gap-3">
          {FAQS.map((faq) => (
            <details key={faq.question} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <summary className="cursor-pointer text-base font-semibold text-white">{faq.question}</summary>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
