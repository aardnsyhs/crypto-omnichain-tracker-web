'use client';

import React from 'react';

export function LoadingState() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="w-full animate-pulse overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/40 shadow-xl backdrop-blur-sm"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="h-5 w-24 rounded-full bg-zinc-800" />
          <div className="h-5 w-20 rounded-full bg-zinc-800/70" />
        </div>
        <div className="h-5 w-28 rounded-full bg-zinc-800/60" />
      </div>

      {/* Rows */}
      <div className="divide-y divide-zinc-800/50 px-5 text-sm">
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
    </div>
  );
}
