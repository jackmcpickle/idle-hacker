import { useGlobalStateProvider } from '@/state/context';
import { HardwareCard } from './HardwareCard';
import type { ReactElement } from 'react';

export function HardwareList(): ReactElement {
    const { state } = useGlobalStateProvider();

    return (
        <div className="space-y-4">
            {state.hardware.map((hw) => (
                <HardwareCard
                    key={hw.id}
                    hardware={hw}
                />
            ))}
        </div>
    );
}
