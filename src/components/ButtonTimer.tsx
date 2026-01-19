import { useCallback } from 'react';
import { useGlobalStateProvider } from '@/state/context';
import { increaseQty } from '@/state/actions';
import { IncomeType } from '@/models/IncomeType';
import { usePurchasePower } from '@/hooks/usePurchasePower';
import { displayHigh } from '@/utils/displayHigh';

interface ButtonTimerProps extends React.HTMLAttributes<HTMLButtonElement> {
    incomeType: IncomeType;
}

export const ButtonTimer: React.FC<ButtonTimerProps> = ({ incomeType }) => {
    const { dispatch } = useGlobalStateProvider();
    const { canAfford, purchaseQty } = usePurchasePower(incomeType);

    const handleIncreaseQty = useCallback(
        (purchaseQty: number) => {
            dispatch(increaseQty(incomeType.name, purchaseQty));
        },
        [dispatch, incomeType],
    );

    return (
        <div className="mt-2 flex">
            <div className="relative -mr-1 inline-flex items-center rounded-l-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">
                {displayHigh(incomeType.getInventory())}
            </div>
            <button
                type="button"
                disabled={!canAfford}
                className="focus:ring-limeborder-lime-50-500 focus:border-lime-50-500 relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:ring-1 focus:outline-hidden"
                onClick={() => handleIncreaseQty(purchaseQty)}
            >
                <span>Buy {displayHigh(purchaseQty)}</span>
                <svg
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="relative z-1 ml-1 h-4 w-4"
                    viewBox="0 0 24 24"
                >
                    <path d="M5 12h14M12 5l7 7-7 7"></path>
                </svg>
            </button>
        </div>
    );
};
