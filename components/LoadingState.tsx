'use client';

import { Loader2 } from 'lucide-react';
import { Card } from './ui/card';

export function LoadingState() {
  return (
    <Card
      aria-busy="true"
      aria-live="polite"
      className="w-full animate-pulse overflow-hidden shadow-xl border-zinc-800/90"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
          <span className="font-sans text-xs font-semibold text-zinc-300">
            Decoding on-chain transaction logs...
          </span>
        </div>
        <div className="h-5 w-24 rounded-full bg-zinc-800/70" />
      </div>

      {/* Skeleton Rows */}
      <div className="divide-y divide-zinc-850/60 px-5 text-sm">
        <div className="space-y-2 py-4">
          <div className="h-3 w-28 rounded bg-zinc-800" />
          <div className="h-4 w-full rounded bg-zinc-800/60" />
        </div>

        <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="h-3 w-24 rounded bg-zinc-800" />
            <div className="h-7 w-36 rounded bg-zinc-800/80" />
            <div className="h-2.5 w-20 rounded bg-zinc-800/40" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-24 rounded bg-zinc-800" />
            <div className="h-7 w-36 rounded bg-zinc-800/80" />
            <div className="h-2.5 w-20 rounded bg-zinc-800/40" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="h-3 w-20 rounded bg-zinc-800" />
            <div className="h-4 w-44 rounded bg-zinc-800/60" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-20 rounded bg-zinc-800" />
            <div className="h-4 w-44 rounded bg-zinc-800/60" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="h-3 w-20 rounded bg-zinc-800" />
            <div className="h-4 w-28 rounded bg-zinc-800/60" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-20 rounded bg-zinc-800" />
            <div className="h-4 w-36 rounded bg-zinc-800/60" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-zinc-800/80 bg-zinc-950/40 px-5 py-3">
        <div className="h-3 w-32 rounded bg-zinc-800/60" />
        <div className="h-7 w-28 rounded-md bg-zinc-800/80" />
      </div>
    </Card>
  );
}
