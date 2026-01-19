import { Terminal, DollarSign, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { displayHigh } from '@/utils/displayHigh';
import type { OfflineProgressReport } from '@/hooks/useGameSync';
import type { ReactElement } from 'react';

type Props = {
    isLoading: boolean;
    offlineProgress: OfflineProgressReport | null;
    onContinue: () => void;
};

function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        const remainingMins = minutes % 60;
        return `${hours}h ${remainingMins}m`;
    }
    if (minutes > 0) {
        return `${minutes}m`;
    }
    return `${seconds}s`;
}

export function LoadingSplash({
    isLoading,
    offlineProgress,
    onContinue,
}: Props): ReactElement {
    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3">
                        <Terminal className="h-10 w-10 text-lime-500" />
                        <h1 className="text-3xl font-bold text-white">
                            Idle Hacker
                        </h1>
                    </div>
                    <Spinner
                        size="lg"
                        className="text-lime-500"
                    />
                    <p className="text-gray-400">Loading game data...</p>
                </div>
            </div>
        );
    }

    if (offlineProgress) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950">
                <div className="flex max-w-sm flex-col items-center gap-6 px-4">
                    <div className="flex items-center gap-3">
                        <Terminal className="h-10 w-10 text-lime-500" />
                        <h1 className="text-3xl font-bold text-white">
                            Welcome Back
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>
                            You were away for{' '}
                            {formatDuration(offlineProgress.timeAwayMs)}
                        </span>
                    </div>

                    <div className="w-full rounded-lg border border-gray-700 bg-gray-800 p-4">
                        <h2 className="mb-3 text-center text-lg font-semibold text-white">
                            While you were away...
                        </h2>

                        <div className="space-y-3">
                            {offlineProgress.earnedWhileAway > 0 && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <DollarSign className="h-5 w-5 text-lime-500" />
                                        <span>Income Earned</span>
                                    </div>
                                    <span className="font-mono text-lg font-bold text-lime-400">
                                        +$
                                        {displayHigh(
                                            offlineProgress.earnedWhileAway,
                                        )}
                                    </span>
                                </div>
                            )}

                            {offlineProgress.influenceEarned > 0 && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <Zap className="h-5 w-5 text-purple-500" />
                                        <span>Influence Gained</span>
                                    </div>
                                    <span className="font-mono text-lg font-bold text-purple-400">
                                        +{offlineProgress.influenceEarned}
                                    </span>
                                </div>
                            )}

                            {offlineProgress.hackCostsPaid > 0 && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <Terminal className="h-5 w-5 text-red-500" />
                                        <span>Hack Costs</span>
                                    </div>
                                    <span className="font-mono text-lg font-bold text-red-400">
                                        -$
                                        {displayHigh(
                                            offlineProgress.hackCostsPaid,
                                        )}
                                    </span>
                                </div>
                            )}

                            {offlineProgress.hacksCompleted > 0 && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <Terminal className="h-5 w-5 text-purple-500" />
                                        <span>Hacks Completed</span>
                                    </div>
                                    <span className="font-mono text-lg font-bold text-purple-400">
                                        {offlineProgress.hacksCompleted}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <Button
                        onClick={onContinue}
                        className="w-full bg-lime-600 hover:bg-lime-700"
                    >
                        Continue
                    </Button>
                </div>
            </div>
        );
    }

    return <></>;
}
