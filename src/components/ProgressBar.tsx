import { usePurchasePower } from '@/hooks/usePurchasePower';
import { useTimer } from '@/hooks/useTimer';
import { IncomeType } from '@/models/IncomeType';
import { classNames } from '@/utils/classNames';
import { ReactElement } from 'react';

interface ProgressBarProps {
    incomeType: IncomeType;
}

export function ProgressBar({ incomeType }: ProgressBarProps): ReactElement {
    const { canAfford } = usePurchasePower(incomeType);
    const { percent } = useTimer(incomeType);

    return (
        <div className="relative z-0 inline-flex items-stretch w-full rounded-md shadow-sm">
            <div
                className={classNames(
                    canAfford
                        ? 'bg-lime-200 group-hover:bg-lime-300'
                        : 'bg-slate-200',
                    'overflow-hidden flex-grow h-10 text-xs flex rounded-l-md items-center'
                )}
            >
                <div
                    style={{
                        width: `${incomeType.hasInventory() ? percent : 0}%`,
                    }}
                    className={classNames(
                        canAfford ? 'bg-lime-500 group-hover:bg-lime-600' : '',
                        incomeType.hasInventory() && !canAfford
                            ? 'bg-slate-400'
                            : '',
                        percent === 100 && incomeType.isFastCountdown()
                            ? 'progress-bar-striped animate-progress'
                            : '',
                        'shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-50 ease-in h-10'
                    )}
                ></div>
                <span className="absolute px-4 text-base text-black opacity-75">
                    ${incomeType.getIncome().display()} every{' '}
                    {(incomeType.getCountdown() / 1000).toFixed(2)} sec
                </span>
            </div>
        </div>
    );
}
