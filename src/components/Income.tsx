import { useGlobalStateProvider } from '@/state/context';
import { ButtonTimer } from '@/components/ButtonTimer';

export const Income = () => {
    const { state } = useGlobalStateProvider();

    const incomes = state.incomeTypes.map((incomeType, index) => {
        return (
            <div className="w-full p-4" key={index}>
                <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <h2 className="mb-2 text-lg font-medium text-gray-900 title-font">
                        ${incomeType.getCost()} {incomeType.name} [{incomeType.getInventory()}] gives + $
                        {incomeType.getValue()} each
                    </h2>
                    <ButtonTimer incomeType={incomeType} />
                </div>
            </div>
        );
    });

    return <div className="flex flex-wrap -m-4">{incomes}</div>;
};
