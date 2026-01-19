import { usePurchasePower } from '@/hooks/usePurchasePower';
import { useTimer } from '@/hooks/useTimer';
import { IncomeType } from '@/models/IncomeType';
import { clsx } from 'clsx';
import { useMemo, type ReactElement } from 'react';

interface ProgressBarProps {
    incomeType: IncomeType;
}

interface ProgressBarFillProps {
    percent: number;
    canAfford: boolean;
    hasInventory: boolean;
    isFastCountdown: boolean;
}

function ProgressBarFill({
    percent,
    canAfford,
    hasInventory,
    isFastCountdown,
}: ProgressBarFillProps): ReactElement {
    const width = hasInventory ? percent : 0;

    const className = useMemo(
        () =>
            clsx(
                canAfford ? 'bg-lime-500 group-hover:bg-lime-600' : '',
                hasInventory && !canAfford ? 'bg-slate-400' : '',
                percent === 100 && isFastCountdown
                    ? 'progress-bar-striped animate-progress'
                    : '',
                'flex h-10 flex-col justify-center text-center whitespace-nowrap text-white shadow-none transition-all duration-50 ease-in',
            ),
        [canAfford, hasInventory, isFastCountdown, percent],
    );

    return (
        <div
            style={{ width: `${width}%` }}
            className={className}
        />
    );
}

export function ProgressBar({ incomeType }: ProgressBarProps): ReactElement {
    const { canAfford } = usePurchasePower(incomeType);
    const { percent } = useTimer(incomeType);

    // Memoize values that don't change with timer
    const hasInventory = useMemo(() => incomeType.hasInventory(), [incomeType]);
    const isFastCountdown = useMemo(
        () => incomeType.isFastCountdown(),
        [incomeType],
    );
    const incomeDisplay = useMemo(
        () => incomeType.getIncome().display(),
        [incomeType],
    );
    const countdownSec = useMemo(
        () => (incomeType.getCountdown() / 1000).toFixed(2),
        [incomeType],
    );

    const containerClass = useMemo(
        () =>
            clsx(
                canAfford
                    ? 'bg-lime-200 group-hover:bg-lime-300'
                    : 'bg-slate-200',
                'flex h-10 grow items-center overflow-hidden rounded-l-md text-xs',
            ),
        [canAfford],
    );

    return (
        <div className="relative z-0 inline-flex w-full items-stretch rounded-md shadow-xs">
            <div className={containerClass}>
                <ProgressBarFill
                    percent={percent}
                    canAfford={canAfford}
                    hasInventory={hasInventory}
                    isFastCountdown={isFastCountdown}
                />
                <span className="absolute px-4 text-base text-black opacity-75">
                    ${incomeDisplay} every {countdownSec} sec
                </span>
            </div>
        </div>
    );
}
