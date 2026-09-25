'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard } from '../lib/validation';
import { cn } from '../lib/utils';

interface CopyButtonProps {
  text: string;
  label?: string;
  iconOnly?: boolean;
  className?: string;
}

export function CopyButton({ text, label, iconOnly = false, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const actionLabel = label ? `Copy ${label}` : 'Copy to clipboard';

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? 'Copied to clipboard!' : actionLabel}
      aria-label={copied ? 'Copied to clipboard!' : actionLabel}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-md p-1 transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 active:scale-95',
        copied
          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
          : 'bg-zinc-800/80 text-zinc-400 border border-zinc-700/60 hover:bg-zinc-750 hover:text-zinc-100 hover:border-zinc-600',
        iconOnly ? 'h-6 w-6' : 'px-2 py-0.5 text-[11px] font-sans font-medium gap-1',
        className,
      )}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-emerald-400 shrink-0 stroke-[2.5]" aria-hidden="true" />
          {!iconOnly && <span className="font-sans">Copied</span>}
        </>
      ) : (
        <>
          <Copy className="h-3 w-3 shrink-0 stroke-[1.75]" aria-hidden="true" />
          {!iconOnly && label && <span className="font-sans">{label}</span>}
        </>
      )}
    </button>
  );
}
