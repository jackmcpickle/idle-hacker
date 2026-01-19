import { createFileRoute } from '@tanstack/react-router';
import { HardwareList } from '@/components/hardware/HardwareList';
import { useGlobalStateProvider } from '@/state/context';
import type { ReactElement } from 'react';

export const Route = createFileRoute('/_app/hardware')({
    component: HardwarePage,
});

function HardwarePage(): ReactElement {
    const { state } = useGlobalStateProvider();

    const totalSpeedBonus = state.hardware.reduce(
        (sum, hw) => sum + hw.getSpeedBonus(),
        0,
    );

    return (
        <div>
            <div className="mb-4">
                <h1 className="text-xl font-bold">Hardware</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Upgrade hardware to boost income speed & unlock hack jobs
                </p>
                <div className="mt-2 inline-block rounded-full bg-lime-100 px-3 py-1 text-sm font-medium text-lime-700 dark:bg-lime-900/30 dark:text-lime-400">
                    Total Speed: +{(totalSpeedBonus * 100).toFixed(0)}%
                </div>
            </div>
            <HardwareList />
        </div>
    );
}
