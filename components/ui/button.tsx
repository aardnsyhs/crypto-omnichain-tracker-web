import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-zinc-100 text-zinc-950 shadow-sm hover:bg-white active:bg-zinc-200 font-semibold',
        secondary:
          'border border-zinc-800 bg-zinc-900/90 text-zinc-200 shadow-sm hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-700',
        outline:
          'border border-zinc-700/80 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600',
        ghost:
          'text-zinc-400 hover:bg-zinc-850/60 hover:text-zinc-200 active:bg-zinc-800',
        destructive:
          'border border-rose-800/80 bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 hover:text-rose-200',
        link: 'text-zinc-300 underline-offset-4 hover:underline hover:text-zinc-100 p-0 h-auto',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-7 rounded-md px-2.5 text-xs',
        lg: 'h-11 rounded-lg px-6 text-sm font-semibold',
        icon: 'h-8 w-8',
        'icon-sm': 'h-6 w-6 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
