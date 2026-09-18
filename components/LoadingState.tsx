'use client';

import React from 'react';

export function LoadingState() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="w-full animate-pulse rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur"
    >
      <div className="mb-6 flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-24 rounded-full bg-slate-800" />
          <div className="h-6 w-16 rounded-md bg-slate-800" />
        </div>
        <div className="h-5 w-32 rounded bg-slate-800" />
      </div>

      {/* Transaction Hash */}
      <div className="mb-6 space-y-2">
        <div className="h-3.5 w-28 rounded bg-slate-800" />
        <div className="h-8 w-full rounded-lg bg-slate-800/80" />
      </div>

      {/* Grid of Addresses & Details */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2 rounded-lg border border-slate-800/60 bg-slate-950/40 p-4">
          <div className="h-3 w-16 rounded bg-slate-800" />
          <div className="h-5 w-full rounded bg-slate-800" />
        </div>
        <div className="space-y-2 rounded-lg border border-slate-800/60 bg-slate-950/40 p-4">
          <div className="h-3 w-16 rounded bg-slate-800" />
          <div className="h-5 w-full rounded bg-slate-800" />
        </div>
        <div className="space-y-2 rounded-lg border border-slate-800/60 bg-slate-950/40 p-4">
          <div className="h-3 w-20 rounded bg-slate-800" />
          <div className="h-6 w-32 rounded bg-slate-800" />
        </div>
        <div className="space-y-2 rounded-lg border border-slate-800/60 bg-slate-950/40 p-4">
          <div className="h-3 w-16 rounded bg-slate-800" />
          <div className="h-6 w-32 rounded bg-slate-800" />
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 pt-4">
        <div className="h-4 w-40 rounded bg-slate-800" />
        <div className="h-8 w-36 rounded-md bg-slate-800" />
      </div>
    </div>
  );
}
