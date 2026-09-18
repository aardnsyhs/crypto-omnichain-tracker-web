export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-xl rounded-xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur">
        <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
          <h1 className="text-xl font-bold tracking-tight text-white">
            Crypto Omnichain Transaction Tracker
          </h1>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
            Milestone 1B
          </span>
        </div>

        <p className="mb-6 text-sm text-slate-400">
          Frontend foundation shell initialized with Next.js App Router and Tailwind CSS. Backend
          integration is deferred to later milestones; live network calls and interactive
          transaction lookups are not yet active.
        </p>

        <div className="space-y-3 rounded-lg bg-slate-950/80 p-4 font-mono text-xs text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-500">Repository:</span>
            <span>crypto-omnichain-tracker-web</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Contract Reference:</span>
            <span className="text-indigo-400">docs/api-contract-reference.md</span>
          </div>
        </div>
      </div>
    </main>
  );
}
