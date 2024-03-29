import { useGlobalStateProvider } from '@/state/context';
import { displayHigh } from '@/utils/displayHigh';
import { CommandLineIcon } from '@heroicons/react/24/solid';
import { PurchaseMultiplier } from './PurchaseMultiplier';

export function Header() {
    const { state } = useGlobalStateProvider();
    const totalIncomeOverTime = displayHigh(
        state.incomeTypes
            .filter((i) => i.hasInventory())
            .reduce(
                (sum, i) =>
                    sum + (i.getIncome().real() / i.getCountdown()) * 1000,
                0
            )
    );
    return (
        <div className="overflow-hidden bg-white rounded-lg shadow">
            <h2
                className="sr-only"
                id="profile-overview-title"
            >
                Idle Hacker
            </h2>
            <div className="p-6 bg-white">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="sm:flex sm:space-x-5">
                        <div className="flex-shrink-0">
                            <CommandLineIcon className="w-16 h-16 text-lime-900" />
                        </div>
                        <div className="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
                            <p className="text-sm font-medium text-gray-600">
                                Hack the things
                            </p>
                            <p className="text-xl font-bold text-gray-900 sm:text-2xl">
                                Idle Hacker
                            </p>
                            <p className="text-sm font-medium text-gray-600">
                                Collect and level up gear to earn and hack
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-center mt-5 sm:mt-0">
                        <PurchaseMultiplier />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 border-t border-gray-200 divide-y divide-gray-200 bg-gray-50 sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
                <div className="px-6 py-5 text-sm font-medium text-center">
                    <span className="text-gray-900">Bank: </span>
                    <span className="text-gray-600">
                        ${displayHigh(state.bank)}
                    </span>
                </div>
                <div className="px-6 py-5 text-sm font-medium text-center">
                    <span className="text-gray-900">Items: </span>
                    <span className="text-gray-600">
                        {state.incomeTypes.reduce(
                            (sum, i) => sum + i.getInventory(),
                            0
                        )}
                    </span>
                </div>
                <div className="px-6 py-5 text-sm font-medium text-center">
                    <span className="text-gray-900">Avg Income: </span>
                    <span className="text-gray-600">
                        ${totalIncomeOverTime} / 1 sec
                    </span>
                </div>
            </div>
        </div>
    );
}
