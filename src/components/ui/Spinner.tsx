import { LoaderCircle } from 'lucide-react';
import type { ReactElement } from 'react';
import { cn } from '@/utils/cn';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sizeClasses = {
    xs: 'size-3',
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-6',
    xl: 'size-7',
} satisfies Record<SpinnerSize, string>;

interface Props {
    size?: SpinnerSize;
    className?: string;
}

export function Spinner({ className, size = 'md' }: Props): ReactElement {
    return (
        <div
            className={cn(
                'inline-flex items-center justify-center px-3 transition',
                'animate-[500ms_spin_linear_infinite]',
                className,
            )}
        >
            <LoaderCircle className={`${sizeClasses[size]}`} />
        </div>
    );
}
