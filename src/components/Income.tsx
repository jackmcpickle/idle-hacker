import { useGlobalStateProvider } from '@/state/context';
import { ButtonTimer } from '@/components/ButtonTimer';

export const Income = () => {
    const { state } = useGlobalStateProvider();

    const incomes = state.incomeTypes.map((incomeType, index) => {
        return (
            <div className="p-4 xl:w-1/3 md:w-1/2" key={index}>
                <div className="p-6 border border-gray-200 rounded-lg">
                    <h2 className="mb-2 text-lg font-medium text-gray-900 title-font">
                        ${incomeType.getCost()} {incomeType.name} [{incomeType.getInventory()}]
                    </h2>
                    <p>
                        ${incomeType.getIncome()} every {incomeType.getCountdown() / 1000} sec
                    </p>
                    <p>
                        <ButtonTimer incomeType={incomeType} />
                    </p>
                </div>
            </div>
        );
    });

    return <div className="flex flex-wrap -m-4">{incomes}</div>;
};
