import {
    createContext,
    useContext,
    type ReactElement,
    type ReactNode,
} from 'react';
import { useGameSync, type OfflineProgressReport } from '@/hooks/useGameSync';

type GameSyncContextValue = {
    sync: () => Promise<void>;
    isLoading: boolean;
    offlineProgress: OfflineProgressReport | null;
    clearOfflineProgress: () => void;
};

const GameSyncContext = createContext<GameSyncContextValue | null>(null);

export function GameSyncProvider({
    children,
}: {
    children: ReactNode;
}): ReactElement {
    const { sync, isLoading, offlineProgress, clearOfflineProgress } =
        useGameSync();
    return (
        <GameSyncContext.Provider
            value={{ sync, isLoading, offlineProgress, clearOfflineProgress }}
        >
            {children}
        </GameSyncContext.Provider>
    );
}

export function useGameSyncContext(): GameSyncContextValue {
    const ctx = useContext(GameSyncContext);
    if (!ctx) {
        throw new Error(
            'useGameSyncContext must be used within GameSyncProvider',
        );
    }
    return ctx;
}
