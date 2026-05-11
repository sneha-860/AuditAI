export default function AuditLoading() {
  return (
    <main id="main-content" className="min-h-screen bg-[#0a0a0a] px-6 py-8 text-white">
      <section className="mx-auto max-w-[900px] space-y-4">
        <div className="space-y-4 border-b-[0.5px] border-[#1a3326] bg-gradient-to-b from-[#0d1f18] to-[#0a0a0a] px-6 py-8 text-center">
          <div className="audit-pulse mx-auto h-4 w-[300px] max-w-full rounded bg-[#1a1a1a]" />
          <div className="audit-pulse mx-auto h-12 w-[160px] rounded bg-[#1a1a1a]" />
        </div>
        <div className="space-y-2">
          <div className="audit-pulse h-20 rounded-lg border-[0.5px] border-[#1e1e1e] bg-[#111]" />
          <div className="audit-pulse h-20 rounded-lg border-[0.5px] border-[#1e1e1e] bg-[#111]" />
          <div className="audit-pulse h-20 rounded-lg border-[0.5px] border-[#1e1e1e] bg-[#111]" />
        </div>
      </section>
    </main>
  );
}
