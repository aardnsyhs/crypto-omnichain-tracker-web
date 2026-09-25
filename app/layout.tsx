import type { Metadata } from 'next';
import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Transaction Story Explorer | EVM Omnichain Investigative Ledger',
  description:
    'Investigate transaction intent, token movements, and approval allowances across EVM chains with verified on-chain decoding.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn('dark font-sans', geist.variable, geistMono.variable)}>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-emerald-500/25 selection:text-emerald-200">
        <TooltipProvider delay={150}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
