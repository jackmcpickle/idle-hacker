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
        <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Buy x number
            </label>
            <select
                id="location"
                name="location"
                onChange={handleChange}
                className="block w-full py-2 pl-3 pr-10 mt-1 text-base border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={state.purchaseMultiplier.value}
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
