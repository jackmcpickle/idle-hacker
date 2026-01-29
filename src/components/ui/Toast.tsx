import { useEffect, type ReactElement } from 'react';
import { cn } from '@/utils/cn';
import { X, Zap } from 'lucide-react';

export type ToastData = {
    id: string;
    message: string;
    subMessage?: string;
};

type Props = {
    toast: ToastData;
    onDismiss: (id: string) => void;
};

export function Toast({ toast, onDismiss }: Props): ReactElement {
    useEffect(() => {
        const timer = setTimeout(() => onDismiss(toast.id), 4000);
        return () => clearTimeout(timer);
    }, [toast.id, onDismiss]);

    return (
        <div
            className={cn(
                'pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-lg border border-purple-200 bg-white p-4 shadow-lg dark:border-purple-700 dark:bg-gray-800',
                'animate-in slide-in-from-top-2 fade-in duration-200',
            )}
        >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {toast.message}
                </p>
                {toast.subMessage && (
                    <p className="text-xs text-purple-600 dark:text-purple-400">
                        {toast.subMessage}
                    </p>
                )}
            </div>
            <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
