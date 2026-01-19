import { setPurchaseMultiplier } from '@/state/actions';
import { useGlobalStateProvider } from '@/state/context';
import { cn } from '@/utils/cn';
import { useCallback, type ReactElement } from 'react';

const options = [
    { value: '1', label: 'x1' },
    { value: '10', label: 'x10' },
    { value: '100', label: 'x100' },
    { value: '100%', label: 'MAX' },
];

export function PurchaseMultiplier(): ReactElement {
    const { state, dispatch } = useGlobalStateProvider();

    const handleSelect = useCallback(
        (value: string) => {
            const isPercent = value.includes('%');
            dispatch(setPurchaseMultiplier(value, isPercent));
        },
        [dispatch],
    );

    return (
        <div className="flex overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            {options.map((o) => (
                <button
                    type="button"
                    key={o.value}
                    onClick={() => handleSelect(o.value)}
                    className={cn(
                        'px-3 py-1.5 text-xs font-medium transition-colors',
                        state.purchaseMultiplier.value === o.value
                            ? 'bg-lime-500 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
                    )}
                >
                    {o.label}
                </button>
            ))}
        </div>
    );
}
