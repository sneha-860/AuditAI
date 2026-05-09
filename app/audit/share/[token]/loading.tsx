export default function SharedAuditLoading() {
  return (
    <main id="main-content" className="min-h-screen bg-[#0f0f0f] px-4 py-10 text-foreground sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl space-y-5">
        <div className="h-80 animate-pulse rounded-[1.5rem] border border-white/10 bg-white/[0.04]" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-lg border border-white/10 bg-white/[0.04]" />
          <div className="h-64 animate-pulse rounded-lg border border-white/10 bg-white/[0.04]" />
        </div>
      </section>
    </main>
  );
}
