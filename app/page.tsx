"use client";

import { motion } from "framer-motion";
import { BarChart3, ClipboardList, Lock, Share2 } from "lucide-react";
import { AuditStats } from "@/components/AuditStats";
import { SpendForm } from "@/components/SpendForm";

const HOW_IT_WORKS = [
  {
    title: "Enter your tools (30 sec)",
    body: "Select which AI tools you pay for, your plan, and team size.",
    icon: ClipboardList
  },
  {
    title: "Get instant analysis",
    body: "Our rules-based engine compares your spend against current pricing data.",
    icon: BarChart3
  },
  {
    title: "Save money + share",
    body: "Get a personalized report by email. Share your audit via unique link.",
    icon: Share2
  }
];

export default function LandingPage() {
  return (
    <motion.main
      id="main-content"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#0a0a0a] text-white"
    >
      <section className="px-6 pb-[72px] pt-24 text-center">
        <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[#00e87a]/85">
          <span className="h-1 w-1 shrink-0 rounded-full bg-[#00e87a] opacity-75" aria-hidden="true" />
          <span>Free</span>
          <span className="h-1 w-1 shrink-0 rounded-full bg-[#00e87a] opacity-75" aria-hidden="true" />
          <span>No signup</span>
          <span className="h-1 w-1 shrink-0 rounded-full bg-[#00e87a] opacity-75" aria-hidden="true" />
          <span>Instant results</span>
        </p>
        <h1 className="mx-auto mt-5 max-w-[640px] text-[32px] font-semibold leading-[1.1] text-white md:text-[48px] lg:text-[56px]">
          Stop Overpaying
          <br />
          for <span className="text-[#00e87a]">AI Tools</span>
        </h1>
        <p className="mx-auto mb-8 mt-5 max-w-[480px] text-[16px] font-normal leading-[1.65] text-[#aaa]">
          Free 60-second audit shows exactly where your startup is wasting money on AI subscriptions.
        </p>
        <a
          href="#spend-form"
          className="inline-flex rounded-[10px] bg-[#00e87a] px-9 py-[14px] text-[15px] font-semibold text-black transition hover:-translate-y-px hover:bg-[#00d970] active:translate-y-0"
        >
          Audit My AI Spend &rarr;
        </a>
        <p className="mt-4 flex items-center justify-center gap-[6px] text-[12px] text-[#666]">
          <Lock className="h-3 w-3 text-[#00e87a]/70" aria-hidden="true" />
          No signup required. We show you savings first.
        </p>
      </section>

      <section className="audit-border border-y border-[#1e1e1e] bg-[#0f0f0f] px-6 py-3">
        <AuditStats />
      </section>

      <section id="how-it-works" className="mx-auto max-w-[1100px] px-6 py-12">
        <h2 className="mb-10 text-center text-[18px] font-medium text-white">How it works</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {HOW_IT_WORKS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="audit-border rounded-xl border-[#1e1e1e] bg-[#111] p-5">
                <div className="mb-4 text-[13px] font-medium text-[#444]">0{index + 1}</div>
                <Icon className="mb-3 h-[22px] w-[22px] text-[#00e87a]" aria-hidden="true" />
                <h3 className="mb-2 mt-[14px] text-[15px] font-medium text-white">{step.title}</h3>
                <p className="text-[13px] leading-[1.6] text-[#888]">{step.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="pb-20 pt-0">
        <SpendForm />
      </section>
    </motion.main>
  );
}
