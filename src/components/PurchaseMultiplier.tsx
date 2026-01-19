import { setPurchaseMultiplier } from '@/state/actions';
import { useGlobalStateProvider } from '@/state/context';
import { ChangeEvent, useCallback } from 'react';

const options = [
    {
        value: '1',
        label: 'x1',
    },
    {
        value: '10',
        label: 'x10',
    },
    {
        value: '100',
        label: 'x100',
    },
    {
        value: '1000',
        label: 'x1000',
    },
    {
        value: '10%',
        label: '10%',
    },
    {
        value: '25%',
        label: '25%',
    },
    {
        value: '50%',
        label: '50%',
    },
    {
        value: '75%',
        label: '75%',
    },
    {
        value: '100%',
        label: 'MAX',
    },
];

export function PurchaseMultiplier() {
    const { state, dispatch } = useGlobalStateProvider();

    const handleChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        const isPercent = value.includes('%');
        dispatch(setPurchaseMultiplier(value, isPercent));
    }, []);

    return (
        <div className="flex items-center">
            <label
                htmlFor="location"
                className="mx-2 block text-sm font-medium text-gray-700"
            >
                Buy
            </label>
            <select
                id="location"
                name="location"
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-lime-500 focus:ring-lime-500 focus:outline-none sm:text-sm"
                value={state.purchaseMultiplier.value}
            >
                {options.map((o) => (
                    <option
                        key={o.value}
                        value={o.value}
                    >
                        {o.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
