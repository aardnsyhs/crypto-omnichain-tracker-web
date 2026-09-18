'use client';

import React from 'react';
import type { SupportedChain } from '../lib/api-types';
import { SUPPORTED_CHAINS } from '../lib/validation';

interface ChainSelectProps {
  value: SupportedChain;
  onChange: (chain: SupportedChain) => void;
  disabled?: boolean;
}

const CHAIN_ICONS: Record<SupportedChain, { color: string; badgeBg: string }> = {
  ethereum: {
    color: 'bg-blue-500 text-blue-300 border-blue-500/30',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  bsc: {
    color: 'bg-amber-500 text-amber-300 border-amber-500/30',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  polygon: {
    color: 'bg-purple-500 text-purple-300 border-purple-500/30',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
};

export function ChainSelect({ value, onChange, disabled = false }: ChainSelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor="chain-select"
        className="text-xs font-semibold uppercase tracking-wider text-slate-400"
      >
        Blockchain Network
      </label>
      <div className="relative">
        <select
          id="chain-select"
          value={value}
          onChange={(e) => onChange(e.target.value as SupportedChain)}
          disabled={disabled}
          className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-sm font-medium text-slate-100 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {SUPPORTED_CHAINS.map((chain) => (
            <option key={chain.id} value={chain.id} className="bg-slate-900 text-slate-100">
              {chain.name} ({chain.symbol})
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className="h-4 w-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      <div className="mt-1 flex gap-2">
        {SUPPORTED_CHAINS.map((chain) => {
          const isSelected = value === chain.id;
          const styles = CHAIN_ICONS[chain.id];
          return (
            <button
              key={chain.id}
              type="button"
              onClick={() => !disabled && onChange(chain.id)}
              disabled={disabled}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition ${
                isSelected
                  ? `${styles.badgeBg} border-current ring-1 ring-current/40`
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-300'
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  chain.id === 'ethereum'
                    ? 'bg-blue-400'
                    : chain.id === 'bsc'
                      ? 'bg-amber-400'
                      : 'bg-purple-400'
                }`}
              />
              <span>{chain.symbol}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
