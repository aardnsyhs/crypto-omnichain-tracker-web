import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'cn';

const badgeVariants = cva(
  'group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none [&>svg]:size-3!',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground [a]:hover:bg-primary/80',
        secondary:
          'border-border/60 bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80',
        destructive:
          'border-destructive/30 bg-destructive/15 text-rose-300 [a]:hover:bg-destructive/25',
        outline:
          'border-border/80 text-foreground bg-transparent [a]:hover:bg-muted [a]:hover:text-muted-foreground',
        ghost: 'border-transparent hover:bg-muted hover:text-muted-foreground',
        link: 'border-transparent text-primary underline-offset-4 hover:underline',
        success:
          'border-emerald-500/30 bg-emerald-500/15 text-emerald-300 [a]:hover:bg-emerald-500/25',
        warning: 'border-amber-500/30 bg-amber-500/15 text-amber-300 [a]:hover:bg-amber-500/25',
        info: 'border-cyan-500/30 bg-cyan-500/15 text-cyan-300 [a]:hover:bg-cyan-500/25',
        accent: 'border-border bg-accent text-accent-foreground [a]:hover:bg-accent/80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({
  className,
  variant = 'default',
  render,
  ...props
}: useRender.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: 'badge',
      variant,
    },
  });
}

export { Badge, badgeVariants };
