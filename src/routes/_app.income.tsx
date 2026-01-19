import { createFileRoute } from '@tanstack/react-router';
import { IncomeList } from '@/components/income/IncomeList';
import { PurchaseMultiplier } from '@/components/PurchaseMultiplier';
import { useGlobalStateProvider } from '@/state/context';
import { displayHigh } from '@/utils/displayHigh';
import { TrendingUp } from 'lucide-react';
import type { ReactElement } from 'react';

export const Route = createFileRoute('/_app/income')({
    component: IncomePage,
});

function IncomePage(): ReactElement {
    const { state } = useGlobalStateProvider();

    const totalIncomePerSec = state.incomeTypes.reduce((sum, inc) => {
        if (!inc.hasInventory()) return sum;
        const incomePerCycle = inc.getIncome().real();
        const cycleTime = inc.getCountdown() / 1000;
        return sum + incomePerCycle / cycleTime;
    }, 0);

    return (
        <div>
            <div className="mb-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">Income Sources</h1>
                    <PurchaseMultiplier />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Buy workers to automate income generation
                </p>
                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-lime-100 px-3 py-1 text-sm font-medium text-lime-700 dark:bg-lime-900/30 dark:text-lime-400">
                    <TrendingUp className="h-4 w-4" />$
                    {displayHigh(totalIncomePerSec)}/sec
                </div>
            </div>
            <IncomeList />
        </div>
    );
}
