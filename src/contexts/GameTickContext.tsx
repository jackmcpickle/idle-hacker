import { useEffect, useRef, type ReactElement, type ReactNode } from 'react';
import { useGlobalStateProvider } from '@/state/context';
import { gameTick, clearCompletedHacks } from '@/state/actions';
import { useToast } from '@/contexts/ToastContext';
import { useSettings } from '@/contexts/SettingsContext';

const TICK_INTERVAL = 100;

export function GameTickProvider({
    children,
}: {
    children: ReactNode;
}): ReactElement {
    const { state, dispatch } = useGlobalStateProvider();
    const { showToast } = useToast();
    const { notificationsEnabled } = useSettings();
    const dispatchRef = useRef(dispatch);

    useEffect(() => {
        dispatchRef.current = dispatch;
    }, [dispatch]);

    useEffect(() => {
        const interval = setInterval(() => {
            dispatchRef.current(gameTick(Date.now()));
        }, TICK_INTERVAL);

        return () => clearInterval(interval);
    }, []);

    // Show toast for completed hacks
    useEffect(() => {
        if (!notificationsEnabled || state.completedHacks.length === 0) return;
        for (const hack of state.completedHacks) {
            showToast(
                `${hack.jobName} Complete!`,
                `+${hack.influenceReward} Influence`,
            );
        }
        dispatch(clearCompletedHacks());
    }, [state.completedHacks, showToast, notificationsEnabled, dispatch]);

    return <>{children}</>;
}
