import { useGlobalStateProvider } from '@/state/context';
import { HackingJob } from '@/models/HackingJob';
import { displayHigh } from '@/utils/displayHigh';
import { Terminal, TrendingUp, Zap } from 'lucide-react';
import type { ReactElement } from 'react';

export function AppHeader(): ReactElement {
    const { state } = useGlobalStateProvider();

    // Calculate hardware speed bonus
    const hardwareSpeedBonus = state.hardware.reduce(
        (sum, hw) => sum + hw.getSpeedBonus(),
        0,
    );
    const speedMultiplier = 1 + hardwareSpeedBonus;

    // Income per second (with hardware bonus)
    const incomePerSec = state.incomeTypes
        .filter((i) => i.hasInventory())
        .reduce((sum, i) => {
            const adjustedCountdown = i.getCountdown() / speedMultiplier;
            return sum + (i.getIncome().real() / adjustedCountdown) * 1000;
        }, 0);

    // Debit per second from active hacks
    const debitPerSec = state.activeHacks
        .filter((h): h is NonNullable<typeof h> => h !== null)
        .reduce((sum, h) => {
            const job = new HackingJob(h.jobId);
            return sum + job.getCostPerSecond();
        }, 0);

    const totalFlow = incomePerSec + debitPerSec;
    const incomePercent =
        totalFlow > 0 ? (incomePerSec / totalFlow) * 100 : 100;
    const netPerSec = incomePerSec - debitPerSec;

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
            <div className="border-t border-gray-100 bg-gray-50 px-4 py-1.5 dark:border-gray-800 dark:bg-gray-800">
                <div className="mx-auto flex max-w-lg items-center gap-2">
                    <span className="w-16 text-xs text-green-600 dark:text-green-400">
                        +${displayHigh(incomePerSec)}
                    </span>
                    <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-red-400 dark:bg-red-600">
                        <div
                            className="absolute inset-y-0 left-0 bg-green-500 transition-all duration-300 dark:bg-green-400"
                            style={{ width: `${incomePercent}%` }}
                        />
                    </div>
                    <span className="w-16 text-right text-xs text-red-600 dark:text-red-400">
                        -${displayHigh(debitPerSec)}
                    </span>
                </div>
                <div className="mt-0.5 text-center text-xs">
                    <span
                        className={
                            netPerSec >= 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                        }
                    >
                        {netPerSec >= 0 ? '+' : ''}${displayHigh(netPerSec)}/sec
                    </span>
                </div>
            </div>
        </header>
    );
}
