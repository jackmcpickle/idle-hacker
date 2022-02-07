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
            console.log('INCREASE', purchaseQty);
            dispatch(increaseQty(incomeType.name, purchaseQty));
        },
        [incomeType]
    );

    return (
        <div className="flex mt-2">
            <div className="relative inline-flex items-center px-4 py-2 -mr-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-md">
                {displayHigh(incomeType.getInventory())}
            </div>
            <button
                disabled={!canAfford}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-limeborder-lime-50-500 focus:border-lime-50-500"
                onClick={() => handleIncreaseQty(purchaseQty)}
            >
                <span>Buy {displayHigh(purchaseQty)}</span>
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
