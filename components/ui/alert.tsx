import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'cn';

const alertVariants = cva(
  "group/alert relative grid w-full gap-1 rounded-xl border px-4 py-3 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-3 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4.5",
  {
    variants: {
      variant: {
        default: 'border-border/80 bg-surface-elevated text-foreground',
        destructive:
          'border-destructive/30 bg-destructive/10 text-rose-200 *:data-[slot=alert-description]:text-rose-300/90 *:[svg]:text-rose-400',
        warning:
          'border-amber-500/30 bg-amber-500/10 text-amber-200 *:data-[slot=alert-description]:text-amber-300/90 *:[svg]:text-amber-400',
        info: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200 *:data-[slot=alert-description]:text-cyan-300/90 *:[svg]:text-cyan-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        'font-medium text-sm group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground',
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'text-xs text-muted-foreground leading-relaxed md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-2',
        className,
      )}
      {...props}
    />
  );
}

function AlertAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="alert-action" className={cn('absolute top-3 right-3', className)} {...props} />
  );
}

export { Alert, AlertTitle, AlertDescription, AlertAction };
