import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps, ReactElement } from 'react';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
    "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    {
        variants: {
            variant: {
                default:
                    'bg-primary text-primary-foreground hover:bg-primary/80',
                destructive:
                    'bg-destructive hover:bg-destructive/80 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 text-white',
                outline:
                    'bg-background hover:bg-neutral hover:text-neutral-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border shadow-xs',
                secondary:
                    'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                accent: 'bg-accent text-accent-foreground hover:bg-accent/80',
                neutral:
                    'bg-neutral text-neutral-foreground hover:bg-neutral/80',
                ghost: 'hover:bg-neutral hover:text-neutral-foreground dark:hover:bg-neutral/50',
                link: 'text-primary underline-offset-4 hover:underline',
            },
            size: {
                default: 'h-9 px-4 py-2 has-[>svg]:px-3',
                sm: 'h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5',
                lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
                icon: 'size-9',
                'icon-sm': 'size-8',
                'icon-lg': 'size-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

export type ButtonVariantTypes = VariantProps<typeof buttonVariants>;

function Button({
    className,
    variant = 'default',
    size = 'default',
    asChild = false,
    ...props
}: ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }): ReactElement {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            data-slot="button"
            data-variant={variant}
            data-size={size}
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { Button, buttonVariants };
