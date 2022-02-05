import { useGlobalStateProvider } from '@/state/context';
import { ButtonTimer } from '@/components/ButtonTimer';
import { PurchaseMultiplier } from './PurchaseMultiplier';

export const Income = () => {
    const { state } = useGlobalStateProvider();

    const incomes = state.incomeTypes.map((incomeType, index) => {
        return (
            <div className="w-full p-4" key={index}>
                <div className="p-6 border border-gray-200 rounded-lg">
                    <h2 className="mb-2 text-lg font-medium text-gray-900 title-font">
                        ${incomeType.getCost()} {incomeType.name} [{incomeType.getInventory()}] gives + $
                        {incomeType.getValue()} each
                    </h2>
                    <p>
                        ${incomeType.getIncome()} every {(incomeType.getCountdown() / 1000).toFixed(2)} sec
                    </p>
                    <p>
                        <ButtonTimer incomeType={incomeType} />
                    </p>
                </div>
            </div>
        );
    });

    return (
        <div className="flex flex-wrap -m-4">
            <div className="px-4 py-5 bg-white border-b border-gray-200 sm:px-6">
                <div className="flex flex-wrap items-center justify-between -mt-2 -ml-4 sm:flex-nowrap">
                    <div className="mt-2 ml-4">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Income</h3>
                    </div>
                    <div className="flex-shrink-0 mt-2 ml-4">
                        <PurchaseMultiplier />
                    </div>
                </div>
            </div>
            {incomes}
        </div>
    );
};
