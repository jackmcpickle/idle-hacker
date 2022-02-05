import { useCallback } from 'react';
import { useTimer } from '@/hooks/useTimer';
import { classNames } from '@/utils/classNames';
import { useGlobalStateProvider } from '@/state/context';
import { increaseQty } from '@/state/actions';
import { IncomeType } from '@/models/incomes';
import { usePurchasePower } from '@/hooks/usePurchasePower';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    incomeType: IncomeType;
}

export const ButtonTimer: React.FC<ButtonProps> = ({ incomeType }) => {
    const { dispatch } = useGlobalStateProvider();
    const { percent } = useTimer(incomeType);
    const { canAfford, purchaseQty } = usePurchasePower(incomeType);

    const handleIncreaseQty = useCallback(
        (purchaseQty: number) => {
            console.log('INCREASE', purchaseQty);
            dispatch(increaseQty(incomeType.name, purchaseQty));
        },
        [incomeType]
    );

    return (
        <button
            disabled={!canAfford}
            className="relative inline-flex items-center w-full px-8 py-2 mx-auto mt-16 text-lg text-white border-0 focus:outline-none group"
            onClick={() => handleIncreaseQty(purchaseQty)}
        >
            <div
                className={classNames(
                    canAfford ? 'bg-lime-200 group-hover:bg-lime-300' : 'bg-slate-200',
                    'absolute top-0 left-0 right-0 bottom-0 overflow-hidden h-full text-xs flex rounded'
                )}
            >
                <div
                    style={{ width: `${incomeType.hasInventory() ? percent : 0}%` }}
                    className={classNames(
                        canAfford ? 'bg-lime-500 group-hover:bg-lime-600' : '',
                        incomeType.hasInventory() && !canAfford ? 'bg-slate-400' : '',
                        percent === 100 && incomeType.isFastCountdown() ? 'progress-bar-striped animate-progress' : '',
                        'shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-50 ease-in'
                    )}
                ></div>
            </div>
            <div className="relative z-1">
                Buy {purchaseQty} {incomeType.name}
            </div>
            <svg
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="relative w-4 h-4 ml-1 z-1"
                viewBox="0 0 24 24"
            >
                <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
        </button>
    );
};
