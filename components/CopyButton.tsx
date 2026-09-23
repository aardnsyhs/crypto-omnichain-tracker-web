'use client';

import React, { useState } from 'react';
import { copyToClipboard } from '../lib/validation';

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
      className={`inline-flex shrink-0 items-center justify-center rounded p-1 transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-400 ${
        copied
          ? 'bg-emerald-500/20 text-emerald-300'
          : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100'
      } ${iconOnly ? 'h-6 w-6' : 'px-1.5 py-0.5 text-[11px] font-sans'} ${className}`}
    >
      {copied ? (
        <>
          <svg className="h-3 w-3 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          {!iconOnly && <span className="ml-1">Copied</span>}
        </>
      ) : (
        <>
          <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          {!iconOnly && label && <span className="ml-1">{label}</span>}
        </>
      )}
    </button>
  );
}
