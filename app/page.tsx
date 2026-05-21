"use client";

import { motion } from "framer-motion";
import { ArrowRight, BarChart3, ClipboardList, Lock, Share2, Sparkles } from "lucide-react";
import { AuditStats } from "@/components/AuditStats";
import { SpendForm } from "@/components/SpendForm";

const HOW_IT_WORKS = [
  {
    title: "Map your AI stack",
    body: "Choose the subscriptions, APIs, and seats your team pays for today.",
    icon: ClipboardList
  },
  {
    title: "Spot wasted spend",
    body: "AuditAI flags overlap, unused seats, and plans that are larger than your team needs.",
    icon: BarChart3
  },
  {
    title: "Act with a clear report",
    body: "Review prioritized savings, then share the report with finance or founders.",
    icon: Share2
  }
];

const HERO_METRICS = [
  { value: "8", label: "AI tools checked" },
  { value: "$0", label: "cost to run" },
  { value: "<60s", label: "to first report" }
];

export default function LandingPage() {
  return (
    <motion.main
      id="main-content"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#090909] text-white"
    >
      <section className="relative overflow-hidden border-b-[0.5px] border-[#1c1c1c] px-6 py-16 text-center sm:py-20 lg:py-24">
        <div className="absolute inset-0 bg-[linear-gradient(#151515_1px,transparent_1px),linear-gradient(90deg,#151515_1px,transparent_1px)] bg-[size:56px_56px] opacity-[0.16]" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1040px]">
          <p className="inline-flex items-center gap-2 rounded-full border-[0.5px] border-[#1a4030] bg-[#0d1f18] px-3 py-[7px] text-[11px] font-medium uppercase tracking-[0.12em] text-[#00e87a]/90 shadow-[0_0_0_4px_rgba(0,232,122,0.04)]">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            <span>Free audit - no signup - instant results</span>
          </p>
          <h1 className="mx-auto mt-7 max-w-[820px] text-[42px] font-semibold leading-[1.02] text-white md:text-[64px] lg:text-[76px]">
            Stop Overpaying
            <br />
            for <span className="text-[#00e87a]">AI Tools</span>
          </h1>
          <p className="mx-auto mb-9 mt-6 max-w-[620px] text-[18px] font-normal leading-[1.7] text-[#bdbdbd]">
            Audit subscriptions, seat counts, and API spend to find duplicate tools and oversized plans before the next billing cycle.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#spend-form"
              className="inline-flex h-14 w-full max-w-[276px] items-center justify-center gap-2 rounded-[10px] bg-[#00e87a] px-8 text-[15px] font-semibold text-black shadow-[0_0_34px_rgba(0,232,122,0.18)] transition hover:-translate-y-px hover:bg-[#00d970] active:translate-y-0"
            >
              Audit My AI Spend
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <span className="inline-flex h-14 w-full max-w-[220px] items-center justify-center gap-[7px] rounded-[10px] border-[0.5px] border-[#252525] bg-[#101010]/90 px-4 text-[12px] text-[#8a8a8a]">
              <Lock className="h-3.5 w-3.5 text-[#00e87a]/75" aria-hidden="true" />
              Savings before email
            </span>
          </div>
          <div className="mx-auto mt-12 grid max-w-[620px] grid-cols-3 border-y-[0.5px] border-[#202020] bg-[#0d0d0d]/70">
            {HERO_METRICS.map((metric) => (
              <div key={metric.label} className="px-3 py-4 [&+&]:border-l-[0.5px] [&+&]:border-[#202020]">
                <div className="text-[20px] font-semibold text-white">{metric.value}</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.08em] text-[#666]">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="audit-border border-b border-[#1e1e1e] bg-[#0f0f0f] px-6 py-3">
        <AuditStats />
      </section>

      <section id="how-it-works" className="mx-auto max-w-[1180px] px-6 py-20">
        <div className="mb-12 grid gap-6 md:grid-cols-[0.9fr_1.1fr] md:items-end">
          <div>
            <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-[#00e87a]">Workflow</p>
            <h2 className="mt-3 max-w-[560px] text-[30px] font-semibold leading-[1.15] text-white md:text-[40px]">
              Turn messy AI spend into a decision-ready audit.
            </h2>
          </div>
          <p className="max-w-[560px] text-[15px] leading-[1.75] text-[#969696] md:justify-self-end">
            AuditAI turns your current tools, seats, and plans into a prioritized savings report your team can actually act on.
          </p>
        </div>
        <div className="relative grid gap-4 md:grid-cols-3">
          <div className="pointer-events-none absolute left-[16.6%] right-[16.6%] top-10 hidden h-px bg-[#222] md:block" aria-hidden="true" />
          {HOW_IT_WORKS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="relative rounded-lg border-[0.5px] border-[#242424] bg-[#101010] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:border-[#2f2f2f] hover:bg-[#121212]">
                <div className="mb-10 flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border-[0.5px] border-[#262626] bg-[#0b0b0b] text-[12px] font-semibold text-[#777]">
                    0{index + 1}
                  </span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg border-[0.5px] border-[#1a4030] bg-[#0d1f18] shadow-[0_0_24px_rgba(0,232,122,0.08)]">
                    <Icon className="h-[18px] w-[18px] text-[#00e87a]" aria-hidden="true" />
                  </span>
                </div>
                <h3 className="mb-3 text-[18px] font-semibold text-white">{step.title}</h3>
                <p className="text-[14px] leading-[1.7] text-[#8f8f8f]">{step.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-t-[0.5px] border-[#1c1c1c] bg-[#0b0b0b] px-0 pb-24 pt-16">
        <div className="mx-auto mb-9 max-w-[780px] px-6 text-center">
          <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-[#00e87a]">Run the audit</p>
          <h2 className="mt-3 text-[28px] font-semibold text-white">Enter your current AI stack</h2>
          <p className="mt-3 text-[14px] leading-[1.7] text-[#888]">Start with any paid tools your team uses. The report calculates monthly spend, likely overlap, and plan-fit savings.</p>
        </div>
        <SpendForm />
      </section>
    </motion.main>
  );
}
