'use client';

import { Loader2 } from 'lucide-react';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';

export function LoadingState() {
  return (
    <Card
      aria-busy="true"
      aria-live="polite"
      className="w-full border-border/80 bg-card/95 backdrop-blur-sm shadow-xl overflow-hidden"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border/80 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
          <span className="font-sans text-xs font-semibold text-foreground">
            Decoding on-chain transaction logs...
          </span>
        </div>
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>

      {/* Skeleton Rows */}
      <div className="divide-y divide-border/40 px-5 text-sm">
        <div className="space-y-2 py-4">
          <Skeleton className="h-3 w-28 rounded" />
          <Skeleton className="h-5 w-full rounded" />
        </div>

        <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24 rounded" />
            <Skeleton className="h-7 w-36 rounded" />
            <Skeleton className="h-2.5 w-20 rounded" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-24 rounded" />
            <Skeleton className="h-7 w-36 rounded" />
            <Skeleton className="h-2.5 w-20 rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-4 w-44 rounded" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-4 w-44 rounded" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border/80 bg-surface-nested/50 px-5 py-3">
        <Skeleton className="h-3 w-32 rounded" />
        <Skeleton className="h-7 w-28 rounded-md" />
      </div>
    </Card>
  );
}
