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
        <div className="relative z-0 inline-flex items-stretch w-full rounded-md shadow-sm">
            <div
                className={classNames(
                    canAfford ? 'bg-lime-200 group-hover:bg-lime-300' : 'bg-slate-200',
                    'overflow-hidden flex-grow h-12 text-xs flex rounded-l-md items-center'
                )}
            >
                <div
                    style={{ width: `${incomeType.hasInventory() ? percent : 0}%` }}
                    className={classNames(
                        canAfford ? 'bg-lime-500 group-hover:bg-lime-600' : '',
                        incomeType.hasInventory() && !canAfford ? 'bg-slate-400' : '',
                        percent === 100 && incomeType.isFastCountdown() ? 'progress-bar-striped animate-progress' : '',
                        'shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-50 ease-in h-12'
                    )}
                ></div>
                <span className="absolute px-4 text-base text-black opacity-75">
                    ${incomeType.getIncome()} every {(incomeType.getCountdown() / 1000).toFixed(2)} sec
                </span>
            </div>
            <button
                disabled={!canAfford}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-limeborder-lime-50-500 focus:border-lime-50-500"
                onClick={() => handleIncreaseQty(purchaseQty)}
            >
                <span>
                    Buy {purchaseQty} {incomeType.name}
                </span>
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
        </div>
    );
};
