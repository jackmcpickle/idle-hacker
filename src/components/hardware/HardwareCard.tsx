import { useGlobalStateProvider } from '@/state/context';
import { useGameSyncContext } from '@/contexts/GameSyncContext';
import { upgradeHardware } from '@/state/actions';
import { displayHigh } from '@/utils/displayHigh';
import { Button } from '@/components/ui/Button';
import { ArrowUp } from 'lucide-react';
import type { HardwareItem } from '@/models/HardwareItem';
import type { ReactElement } from 'react';

type Props = {
    hardware: HardwareItem;
};

export function HardwareCard({ hardware }: Props): ReactElement {
    const { state, dispatch } = useGlobalStateProvider();
    const { sync } = useGameSyncContext();
    const Icon = hardware.getIcon();
    const cost = hardware.getCost();
    const canAfford = state.bank >= cost;
    const canUpgrade = hardware.canUpgrade();

    function handleUpgrade(): void {
        dispatch(upgradeHardware(hardware.id));
        void sync();
    }

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-700">
                        <Icon className="h-6 w-6 text-lime-600 dark:text-lime-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold">{hardware.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {hardware.description}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-lg font-bold">Lv {hardware.level}</div>
                    <div className="text-xs text-gray-500">
                        /{hardware.maxLevel}
                    </div>
                </div>
            </div>

            <div className="mb-3">
                <div className="mb-1 flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                        Speed Bonus
                    </span>
                    <span className="font-medium text-lime-600 dark:text-lime-400">
                        +{(hardware.getSpeedBonus() * 100).toFixed(0)}%
                    </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                        className="h-full bg-lime-500 transition-all"
                        style={{
                            width: `${(hardware.level / hardware.maxLevel) * 100}%`,
                        }}
                    />
                </div>
            </div>

            <Button
                onClick={handleUpgrade}
                disabled={!canAfford || !canUpgrade}
                className="w-full"
                variant={canUpgrade ? 'default' : 'outline'}
            >
                {canUpgrade ? (
                    <>
                        <ArrowUp className="mr-2 h-4 w-4" />
                        Upgrade ${displayHigh(cost)}
                    </>
                ) : (
                    'MAX LEVEL'
                )}
            </Button>
        </div>
    );
}
