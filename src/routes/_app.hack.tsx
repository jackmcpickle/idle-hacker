import { createFileRoute } from '@tanstack/react-router';
import { useGlobalStateProvider } from '@/state/context';
import { HackJobList } from '@/components/hack/HackJobList';
import { ActiveHackProgress } from '@/components/hack/ActiveHackProgress';
import { displayHigh } from '@/utils/displayHigh';
import { Zap } from 'lucide-react';
import type { ActiveHack } from '@/models/HackingJob';
import type { ReactElement } from 'react';

export const Route = createFileRoute('/_app/hack')({
    component: HackPage,
});

type HackSlot = { hack: ActiveHack; slot: number };

function isActiveHackSlot(h: {
    hack: ActiveHack | null;
    slot: number;
}): h is HackSlot {
    return h.hack !== null;
}

function HackPage(): ReactElement {
    const { state } = useGlobalStateProvider();

    const activeHacks = state.activeHacks
        .map((hack, i) => ({ hack, slot: i }))
        .filter(isActiveHackSlot);

    return (
        <div>
            <div className="mb-4">
                <h1 className="text-xl font-bold">Hacking Jobs</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>
                        Slots: {activeHacks.length}/{state.maxHackSlots}
                    </span>
                    <span className="flex items-center gap-1 text-purple-500">
                        <Zap className="h-4 w-4" />
                        {displayHigh(state.influence)} influence
                    </span>
                </div>
            </div>

            {activeHacks.length > 0 && (
                <div className="mb-6 space-y-3">
                    <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Active Hacks
                    </h2>
                    {activeHacks.map(({ hack, slot }) => (
                        <ActiveHackProgress
                            key={slot}
                            hack={hack}
                            slot={slot}
                        />
                    ))}
                </div>
            )}

            <div>
                <h2 className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Available Jobs
                </h2>
                <HackJobList />
            </div>
        </div>
    );
}
