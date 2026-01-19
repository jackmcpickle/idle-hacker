import { useGlobalStateProvider } from '@/state/context';
import { IncomeCard } from './IncomeCard';
import type { ReactElement } from 'react';

export function IncomeList(): ReactElement {
    const { state } = useGlobalStateProvider();

    return (
        <div className="space-y-4">
            {state.incomeTypes.map((incomeType) => (
                <IncomeCard
                    key={incomeType.name}
                    incomeType={incomeType}
                />
            ))}
        </div>
    );
}
