export default function AuditLoading() {
  return (
    <main id="main-content" className="min-h-screen bg-[#0f0f0f] px-4 py-10 text-foreground sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl space-y-5">
        <div className="h-72 animate-pulse rounded-lg border border-[#00ff88]/25 bg-[#00ff88]/10" />
        <div className="h-28 animate-pulse rounded-lg border border-white/10 bg-white/[0.04]" />
        <div className="grid gap-4">
          <div className="h-32 animate-pulse rounded-lg border border-white/10 bg-white/[0.04]" />
          <div className="h-32 animate-pulse rounded-lg border border-white/10 bg-white/[0.04]" />
        </div>
      </section>
    </main>
  );
}
