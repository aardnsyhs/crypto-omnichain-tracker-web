'use client';

import React from 'react';
import {
  AlertTriangle,
  SearchX,
  XCircle,
  Globe,
  Clock,
  ShieldAlert,
  Radio,
  WifiOff,
  RotateCcw,
} from 'lucide-react';
import { ApiClientError } from '../lib/api-errors';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface LookupErrorStateProps {
  error: ApiClientError | Error | null;
  onRetry?: () => void;
}

export function LookupErrorState({ error, onRetry }: LookupErrorStateProps) {
  if (!error) return null;

  let title = 'Lookup Error';
  let description =
    error.message || 'An unexpected error occurred while looking up this transaction.';
  let badgeText = 'Error';
  let badgeVariant:
    'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' | 'info' =
    'destructive';
  let IconComponent = AlertTriangle;
  let hint: string | null = null;
  let requestId = '';

  if (error instanceof ApiClientError) {
    requestId = error.requestId || '';

    switch (error.errorCode) {
      case 'TRANSACTION_NOT_FOUND':
        title = 'Transaction Not Found';
        description =
          'The specified transaction hash was not found on the selected network. It may not exist, might have been dropped from the mempool, or could belong to a different blockchain.';
        badgeText = 'HTTP 404';
        badgeVariant = 'warning';
        IconComponent = SearchX;
        hint = 'Tip: Confirm you selected the correct network (Ethereum, BSC, or Polygon).';
        break;

      case 'INVALID_TRANSACTION_HASH':
        title = 'Invalid Transaction Hash';
        description =
          'The provided transaction hash is malformed. EVM transaction hashes must start with "0x" followed by exactly 64 hexadecimal characters.';
        badgeText = 'HTTP 400';
        badgeVariant = 'destructive';
        IconComponent = XCircle;
        break;

      case 'UNSUPPORTED_CHAIN':
        title = 'Unsupported Chain';
        description =
          'The selected chain is not supported. Please choose Ethereum, BNB Smart Chain, or Polygon.';
        badgeText = 'HTTP 400';
        badgeVariant = 'secondary';
        IconComponent = Globe;
        break;

      case 'RATE_LIMIT_EXCEEDED':
        title = 'Rate Limit Reached';
        description =
          'You have exceeded the public rate limit of 30 lookups per minute. Please pause for a few seconds before trying again.';
        badgeText = 'HTTP 429';
        badgeVariant = 'warning';
        IconComponent = Clock;
        hint = 'The rate limit resets every 60 seconds.';
        break;

      case 'UPSTREAM_RATE_LIMITED':
        title = 'Provider Rate Limited';
        description =
          'The upstream blockchain provider quota is temporarily exhausted. The service will recover shortly.';
        badgeText = 'HTTP 503';
        badgeVariant = 'warning';
        IconComponent = ShieldAlert;
        hint = 'Please wait a moment and try your lookup again.';
        break;

      case 'UPSTREAM_TIMEOUT':
      case 'UPSTREAM_PROVIDER_ERROR':
        title = 'Upstream Provider Unavailable';
        description =
          'The blockchain data provider did not respond within the allocated timeout or experienced an internal issue.';
        badgeText = 'HTTP 502';
        badgeVariant = 'destructive';
        IconComponent = Radio;
        break;

      case 'NETWORK_ERROR':
        title = 'Connection Failed';
        description =
          'Could not establish a connection to the tracker API service. Please verify that the API server is online.';
        badgeText = 'Offline';
        badgeVariant = 'destructive';
        IconComponent = WifiOff;
        break;

      default:
        badgeText = error.statusCode ? `HTTP ${error.statusCode}` : 'Error';
        badgeVariant = 'destructive';
        IconComponent = AlertTriangle;
    }
  }

  return (
    <Card role="alert" className="border-destructive/30 bg-surface-nested shadow-xl">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/15 text-rose-400 shadow-inner">
            <IconComponent className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground font-sans">{title}</h3>
              <Badge variant={badgeVariant} className="font-mono text-[10px]">
                {badgeText}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed font-sans">{description}</p>

            {hint && (
              <p className="mt-2.5 text-xs text-amber-300 font-sans bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5">
                {hint}
              </p>
            )}

            {requestId && (
              <p className="mt-3 font-mono text-[11px] text-muted-foreground">
                Request ID: <span className="text-foreground select-all">{requestId}</span>
              </p>
            )}

            {onRetry && (
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="gap-1.5 min-h-[36px]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Retry Lookup</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
