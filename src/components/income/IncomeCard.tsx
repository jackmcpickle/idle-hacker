import { useCallback } from 'react';
import { useGlobalStateProvider } from '@/state/context';
import { useGameSyncContext } from '@/contexts/GameSyncContext';
import { increaseQty } from '@/state/actions';
import { usePurchasePower } from '@/hooks/usePurchasePower';
import { useTimer } from '@/hooks/useTimer';
import { displayHigh } from '@/utils/displayHigh';
import { Button } from '@/components/ui/Button';
import { Lock, ShoppingCart, Clock, DollarSign } from 'lucide-react';
import { clsx } from 'clsx';
import type { IncomeType } from '@/models/IncomeType';
import type { ReactElement } from 'react';

type Props = {
    incomeType: IncomeType;
};

export function IncomeCard({ incomeType }: Props): ReactElement {
    const { state, dispatch } = useGlobalStateProvider();
    const { sync } = useGameSyncContext();
    const { canAfford, purchaseQty } = usePurchasePower(incomeType);
    const { percent } = useTimer(incomeType);

    const isUnlocked = incomeType.isUnlocked(state.totalEarned);
    const hasInventory = incomeType.hasInventory();
    const Icon = incomeType.getIcon();

    const handlePurchase = useCallback((): void => {
        dispatch(increaseQty(incomeType.name, purchaseQty));
        void sync();
    }, [dispatch, incomeType.name, purchaseQty, sync]);

    // Calculate hardware speed bonus for display
    const hardwareSpeedBonus = state.hardware.reduce(
        (sum, hw) => sum + hw.getSpeedBonus(),
        0,
    );
    const speedMultiplier = 1 + hardwareSpeedBonus;

    // Don't memoize - these depend on mutable class state
    const incomeDisplay = incomeType.getIncome().display();
    const adjustedCountdown = incomeType.getCountdown() / speedMultiplier;
    const countdownSec = (adjustedCountdown / 1000).toFixed(2);
    const isFastCountdown = adjustedCountdown <= 1000;

    if (!isUnlocked) {
        return (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-gray-200 p-2 dark:bg-gray-700">
                        <Lock className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-400">
                            {incomeType.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                            Unlocks at ${displayHigh(incomeType.unlockIncome)}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-700">
                        <Icon className="h-6 w-6 text-lime-600 dark:text-lime-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold">{incomeType.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            ${incomeType.getValue().display()} per unit
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-lg font-bold">
                        {displayHigh(incomeType.getInventory())}
                    </div>
                    <div className="text-xs text-gray-500">owned</div>
                </div>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>{countdownSec}s cycle</span>
                </div>
                <div className="flex items-center gap-1 text-lime-600 dark:text-lime-400">
                    <DollarSign className="h-4 w-4" />
                    <span>${incomeDisplay}/cycle</span>
                </div>
            </div>

            {hasInventory && (
                <div className="mb-3">
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                            className={clsx(
                                'h-full transition-all duration-100',
                                canAfford ? 'bg-lime-500' : 'bg-slate-400',
                                percent === 100 &&
                                    isFastCountdown &&
                                    'progress-bar-striped animate-progress',
                            )}
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                </div>
            )}

            <Button
                onClick={handlePurchase}
                disabled={!canAfford}
                className="w-full"
                variant={canAfford ? 'default' : 'outline'}
            >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Buy {displayHigh(purchaseQty)} - $
                {displayHigh(incomeType.getCost() * purchaseQty)}
            </Button>
        </div>
    );
}
