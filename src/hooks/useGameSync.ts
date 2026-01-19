import { useEffect, useRef, useCallback, useState } from 'react';
import { useGlobalStateProvider } from '@/state/context';
import { useAuth } from '@/contexts/AuthContext';
import {
    loadState,
    setLastSynced,
    applyOfflineProgress,
} from '@/state/actions';
import {
    saveToLocalStorage,
    loadFromLocalStorage,
    serializeState,
    deserializeState,
    calculateOfflineProgress,
} from '@/state/serialize';
import type { GameContext } from '@/state';

const SYNC_INTERVAL_MS = 60_000;
const LAST_ACTIVE_KEY = 'idle-hacker-last-active';

async function fetchServerState(): Promise<{
    state: unknown;
    updatedAt: number;
} | null> {
    try {
        const res = await fetch('/api/game/state', { credentials: 'include' });
        if (!res.ok) return null;
        const data = (await res.json()) as {
            state: unknown;
            updatedAt?: number;
        };
        if (!data.state) return null;
        return { state: data.state, updatedAt: data.updatedAt ?? 0 };
    } catch {
        return null;
    }
}

async function syncToServer(state: GameContext): Promise<boolean> {
    try {
        const serialized = serializeState(state);
        const res = await fetch('/api/game/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state: serialized }),
            credentials: 'include',
        });
        return res.ok;
    } catch {
        return false;
    }
}

export type OfflineProgressReport = {
    earnedWhileAway: number;
    influenceEarned: number;
    hacksCompleted: number;
    hackCostsPaid: number;
    timeAwayMs: number;
};

export function useGameSync(): {
    sync: () => Promise<void>;
    isLoading: boolean;
    offlineProgress: OfflineProgressReport | null;
    clearOfflineProgress: () => void;
} {
    const { state, dispatch } = useGlobalStateProvider();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [offlineProgress, setOfflineProgress] =
        useState<OfflineProgressReport | null>(null);
    const hasLoadedRef = useRef(false);
    const stateRef = useRef(state);
    stateRef.current = state;

    // Load state on mount
    useEffect(() => {
        if (authLoading || hasLoadedRef.current) return;
        hasLoadedRef.current = true;

        async function loadInitialState(): Promise<void> {
            const localState = loadFromLocalStorage();
            const lastActive = parseInt(
                localStorage.getItem(LAST_ACTIVE_KEY) ?? '0',
                10,
            );
            const now = Date.now();

            let stateToUse: GameContext | null = null;

            if (isAuthenticated) {
                const serverData = await fetchServerState();
                if (serverData) {
                    const serverState = deserializeState(serverData.state);
                    if (
                        serverState &&
                        (!localState ||
                            serverData.updatedAt > localState.lastSyncedAt)
                    ) {
                        stateToUse = serverState;
                    }
                }
            }

            if (!stateToUse && localState) {
                stateToUse = localState;
            }

            if (stateToUse) {
                dispatch(loadState(stateToUse));

                // Calculate offline progress
                if (lastActive > 0) {
                    const progress = calculateOfflineProgress(
                        stateToUse,
                        lastActive,
                    );

                    if (
                        progress.earnedWhileAway > 0 ||
                        progress.influenceEarned > 0 ||
                        progress.hackCostsPaid > 0
                    ) {
                        dispatch(
                            applyOfflineProgress({
                                earnedWhileAway: progress.earnedWhileAway,
                                influenceEarned: progress.influenceEarned,
                                completedActiveHackSlots:
                                    progress.completedActiveHackSlots,
                                hackCostsPaid: progress.hackCostsPaid,
                            }),
                        );

                        setOfflineProgress({
                            earnedWhileAway: progress.earnedWhileAway,
                            influenceEarned: progress.influenceEarned,
                            hacksCompleted:
                                progress.completedActiveHackSlots.length,
                            hackCostsPaid: progress.hackCostsPaid,
                            timeAwayMs: now - lastActive,
                        });
                    }
                }
            }

            setIsLoading(false);
        }

        void loadInitialState();
    }, [authLoading, isAuthenticated, dispatch]);

    // Save to localStorage on state change
    useEffect(() => {
        if (isLoading) return;
        saveToLocalStorage(state);
        localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
    }, [state, isLoading]);

    // Manual sync function
    const sync = useCallback(async (): Promise<void> => {
        if (!isAuthenticated) return;
        const success = await syncToServer(stateRef.current);
        if (success) {
            dispatch(setLastSynced(Date.now()));
        }
    }, [isAuthenticated, dispatch]);

    // Background sync every 60s
    useEffect(() => {
        if (!isAuthenticated || isLoading) return;

        const interval = setInterval(() => {
            void syncToServer(stateRef.current).then((success) => {
                if (success) {
                    dispatch(setLastSynced(Date.now()));
                }
            });
        }, SYNC_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [isAuthenticated, isLoading, dispatch]);

    // Sync on visibility change and beforeunload
    useEffect(() => {
        if (!isAuthenticated) return;

        function handleVisibilityChange(): void {
            if (document.visibilityState === 'hidden') {
                const serialized = serializeState(stateRef.current);
                const blob = new Blob([JSON.stringify({ state: serialized })], {
                    type: 'application/json',
                });
                navigator.sendBeacon('/api/game/sync', blob);
            }
        }

        function handleBeforeUnload(): void {
            const serialized = serializeState(stateRef.current);
            const blob = new Blob([JSON.stringify({ state: serialized })], {
                type: 'application/json',
            });
            navigator.sendBeacon('/api/game/sync', blob);
        }

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isAuthenticated]);

    const clearOfflineProgress = useCallback(() => {
        setOfflineProgress(null);
    }, []);

    return { sync, isLoading, offlineProgress, clearOfflineProgress };
}
