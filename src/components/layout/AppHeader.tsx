import { useGlobalStateProvider } from '@/state/context';
import { displayHigh } from '@/utils/displayHigh';
import { Terminal, TrendingUp, Zap } from 'lucide-react';
import type { ReactElement } from 'react';

export function AppHeader(): ReactElement {
    const { state } = useGlobalStateProvider();

    const avgIncome = state.incomeTypes
        .filter((i) => i.hasInventory())
        .reduce(
            (sum, i) => sum + (i.getIncome().real() / i.getCountdown()) * 1000,
            0,
        );

    return (
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
            <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                    <Terminal className="h-6 w-6 text-lime-600 dark:text-lime-400" />
                    <span className="font-bold text-gray-900 dark:text-white">
                        Idle Hacker
                    </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-gray-900 dark:text-white">
                            ${displayHigh(state.bank)}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Zap className="h-4 w-4 text-purple-500" />
                        <span className="font-medium text-gray-900 dark:text-white">
                            {displayHigh(state.influence ?? 0)}
                        </span>
                    </div>
                </div>
            </div>
            <div className="border-t border-gray-100 bg-gray-50 px-4 py-1 text-center text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400">
                ${displayHigh(avgIncome)}/sec
            </div>
        </header>
    );
}
