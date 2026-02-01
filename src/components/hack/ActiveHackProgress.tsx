import { useGlobalStateProvider } from '@/state/context';
import { completeHack } from '@/state/actions';
import { HackingJob, type ActiveHack } from '@/models/HackingJob';
import { Zap, CheckCircle, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { ReactElement } from 'react';

type Props = {
    hack: ActiveHack;
    slot: number;
};

export function ActiveHackProgress({ hack, slot }: Props): ReactElement {
    const { state, dispatch } = useGlobalStateProvider();
    const job = new HackingJob(hack.jobId);
    const now = state.globalTick;

    const effectiveEndsAt = hack.endsAt + hack.totalPausedMs;
    const elapsed = now - hack.startedAt - hack.totalPausedMs;
    const remaining = Math.max(0, effectiveEndsAt - now);
    const progress = Math.min(100, (elapsed / job.duration) * 100);
    const isComplete = remaining <= 0;

    const isPaused = state.bank <= 0 &&
        hack.totalCostPaid < job.getTotalCost();

    const remainingSecs = Math.ceil(remaining / 1000);
    const mins = Math.floor(remainingSecs / 60);
    const secs = remainingSecs % 60;

    function handleComplete(): void {
        dispatch(completeHack(slot));
    }

    return (
        <div className="rounded-lg border-2 border-purple-500 bg-purple-50 p-4 dark:border-purple-400 dark:bg-purple-900/20">
            <div className="mb-2 flex items-center justify-between">
                <h4 className="font-semibold text-purple-700 dark:text-purple-300">
                    {job.name}
                </h4>
                <div className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400">
                    <Zap className="h-4 w-4" />
                    <span>+{job.influenceReward}</span>
                </div>
            </div>

            <div className="mb-2 h-3 overflow-hidden rounded-full bg-purple-200 dark:bg-purple-800">
                <div
                    className="h-full bg-purple-500 transition-all duration-100"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="mb-2 flex items-center justify-between text-xs text-purple-600 dark:text-purple-400">
                <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span>${job.getCostPerSecond().toFixed(2)}/s</span>
                </div>
                <span>
                    ${hack.totalCostPaid.toFixed(0)} / ${job.getTotalCost()}
                </span>
            </div>

            {isPaused && (
                <div className="mb-2 text-center text-sm text-orange-600 dark:text-orange-400">
                    ⏸ Paused - Need funds
                </div>
            )}

            {isComplete ? (
                <Button
                    onClick={handleComplete}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Collect Reward
                </Button>
            ) : (
                <div className="text-center text-sm text-purple-600 dark:text-purple-400">
                    {mins > 0 ? `${mins}m ` : ''}
                    {secs}s remaining
                </div>
            )}
        </div>
    );
}
