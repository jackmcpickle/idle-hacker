import { useGlobalStateProvider } from '@/state/context';
import { startHack } from '@/state/actions';
import { displayHigh } from '@/utils/displayHigh';
import { Button } from '@/components/ui/Button';
import { Play, Lock, Zap, Clock, DollarSign } from 'lucide-react';
import { HackingJob } from '@/models/HackingJob';
import type { HardwareId } from '@/models/HardwareItem';
import type { ReactElement } from 'react';

type Props = {
    job: HackingJob;
};

export function HackJobCard({ job }: Props): ReactElement {
    const { state, dispatch } = useGlobalStateProvider();

    const hwLevels = Object.fromEntries(
        state.hardware.map((h) => [h.id, h.level]),
    ) as Record<HardwareId, number>;

    const meetsRequirements = job.meetsRequirements(hwLevels);
    const canAfford = state.bank >= job.cost;
    const freeSlot = state.activeHacks.findIndex((h) => h === null);
    const hasSlot = freeSlot !== -1;
    const canStart = meetsRequirements && canAfford && hasSlot;

    function handleStart(): void {
        if (canStart) {
            dispatch(startHack(job.id, freeSlot));
        }
    }

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-3 flex items-start justify-between">
                <div>
                    <h3 className="font-semibold">{job.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {job.description}
                    </p>
                </div>
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    Tier {job.tier}
                </span>
            </div>

            <div className="mb-3 grid grid-cols-3 gap-2 text-sm">
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>{job.formatDuration()}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <DollarSign className="h-4 w-4" />
                    <span>{displayHigh(job.cost)}</span>
                </div>
                <div className="flex items-center gap-1 text-purple-500">
                    <Zap className="h-4 w-4" />
                    <span>+{job.influenceReward}</span>
                </div>
            </div>

            {!meetsRequirements && (
                <div className="mb-3 rounded bg-red-50 p-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    <Lock className="mr-1 inline h-3 w-3" />
                    Requires:{' '}
                    {Object.entries(job.requiredHardware)
                        .map(([id, lvl]) => `${id.toUpperCase()} Lv${lvl}`)
                        .join(', ')}
                </div>
            )}

            <Button
                onClick={handleStart}
                disabled={!canStart}
                className="w-full"
                variant={meetsRequirements ? 'default' : 'outline'}
            >
                {!meetsRequirements ? (
                    <>
                        <Lock className="mr-2 h-4 w-4" />
                        Locked
                    </>
                ) : !hasSlot ? (
                    'No Free Slot'
                ) : (
                    <>
                        <Play className="mr-2 h-4 w-4" />
                        Start Hack
                    </>
                )}
            </Button>
        </div>
    );
}
