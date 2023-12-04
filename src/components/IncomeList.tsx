import { useGlobalStateProvider } from '@/state/context';
import { ButtonTimer } from '@/components/ButtonTimer';
import { ProgressBar } from './ProgressBar';
import { clsx } from 'clsx';

export const IncomeList = () => {
    const { state } = useGlobalStateProvider();

    const incomes = state.incomeTypes.map((incomeType, index) => {
        const active = incomeType.isUnlocked(state.bank);
        const Icon = incomeType.getIcon();
        return (
            <div
                className="w-full p-4"
                key={index}
            >
                <div
                    className={clsx(
                        active
                            ? 'bg-white shadow-sm'
                            : 'bg-gray-200 border-gray-400 border-dashed',
                        'p-6 bg-white border border-gray-200 rounded-lg relative'
                    )}
                >
                    <div
                        className={clsx(
                            active ? '' : 'hidden',
                            'absolute p-4 -ml-8 bg-white rounded-full left-1/2 -top-8'
                        )}
                    >
                        <Icon
                            className="w-8 h-8 font-light"
                            aria-hidden="true"
                            title={`${incomeType.getCost()} gives + ${incomeType
                                .getValue()
                                .display()}`}
                        />
                    </div>
                    <h2 className="text-lg font-medium text-gray-900 title-font">
                        {incomeType.name}
                    </h2>
                    {active && (
                        <>
                            <ProgressBar incomeType={incomeType} />
                            <ButtonTimer incomeType={incomeType} />
                        </>
                    )}
                </div>
            </div>
        );
    });

    return <div className="flex flex-wrap -m-4">{incomes}</div>;
};
