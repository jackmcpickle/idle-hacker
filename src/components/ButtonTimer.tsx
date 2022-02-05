import { useCallback, useEffect, useMemo } from 'react';
import { useTimer } from '@/hooks/useTimer';
import { classNames } from '@/utils/classNames';
import { useGlobalStateProvider } from '@/state/context';
import { collectIncome, increaseQty } from '@/state/actions';
import { IncomeType } from '@/models/incomes';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    incomeType: IncomeType;
}

export const ButtonTimer: React.FC<ButtonProps> = ({ incomeType }) => {
    const { state, dispatch } = useGlobalStateProvider();
    const { percent } = useTimer(incomeType.getCountdown(), incomeType.hasInventory());

    useEffect(() => {
        if (percent === 100) {
            dispatch(collectIncome(incomeType.getIncome()));
        }
    }, [incomeType, percent]);

    const purchaseQty = useMemo((): number => {
        return state.purchaseMultiplier.isPercent
            ? Math.round((state.bank * (parseInt(state.purchaseMultiplier.value, 10) / 100)) / incomeType.getCost())
            : parseInt(state.purchaseMultiplier.value, 10);
    }, [state.purchaseMultiplier.value, state.bank]);

    const handleIncreaseQty = useCallback(
        (purchaseQty = 1) => {
            console.log('INCREASE', purchaseQty);
            dispatch(increaseQty(incomeType.name, purchaseQty));
        },
        [incomeType]
    );

    const canAfford = state.bank >= incomeType.getCost() * purchaseQty;

    return (
        <button
            disabled={!canAfford}
            className="relative inline-flex items-center w-full px-8 py-2 mx-auto mt-16 text-lg text-white border-0 rounded focus:outline-none group"
            onClick={() => handleIncreaseQty(purchaseQty)}
        >
            <div
                className={classNames(
                    canAfford ? 'bg-lime-200 group-hover:bg-lime-300' : 'bg-slate-200',
                    'absolute top-0 left-0 right-0 bottom-0 overflow-hidden h-full text-xs flex'
                )}
            >
                <div
                    style={{ width: `${incomeType.hasInventory() ? percent : 0}%` }}
                    className={classNames(
                        canAfford ? 'bg-lime-500 group-hover:bg-lime-600' : '',
                        incomeType.hasInventory() && !canAfford ? 'bg-slate-400' : '',
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
