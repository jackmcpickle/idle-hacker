import { useGlobalStateProvider } from '@/state/context';
import { ButtonTimer } from '@/components/ButtonTimer';
import { ProgressBar } from './ProgressBar';
import { clsx } from 'clsx';

export function IncomeList(): React.JSX.Element {
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
                            ? 'bg-white shadow-xs'
                            : 'border-dashed border-gray-400 bg-gray-200',
                        'relative rounded-lg border border-gray-200 bg-white p-6',
                    )}
                >
                    <div
                        className={clsx(
                            active ? '' : 'hidden',
                            'absolute -top-8 left-1/2 -ml-8 rounded-full bg-white p-4',
                        )}
                    >
                        <Icon
                            className="h-8 w-8 font-light"
                            aria-hidden="true"
                            title={`${incomeType.getCost()} gives + ${incomeType
                                .getValue()
                                .display()}`}
                        />
                    </div>
                    <h2 className="title-font text-lg font-medium text-gray-900">
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

    return <div className="-m-4 flex flex-wrap">{incomes}</div>;
}
