import { createFileRoute, Outlet } from '@tanstack/react-router';
import { GlobalStateProvider } from '@/state/context';
import { GameTickProvider } from '@/contexts/GameTickContext';
import {
    GameSyncProvider,
    useGameSyncContext,
} from '@/contexts/GameSyncContext';
import { AppHeader } from '@/components/layout/AppHeader';
import { TabBar } from '@/components/layout/TabBar';
import { LoadingSplash } from '@/components/LoadingSplash';
import type { ReactElement } from 'react';

export const Route = createFileRoute('/_app')({
    component: AppLayout,
});

function AppContent(): ReactElement {
    const { isLoading, offlineProgress, clearOfflineProgress } =
        useGameSyncContext();

    if (isLoading || offlineProgress) {
        return (
            <LoadingSplash
                isLoading={isLoading}
                offlineProgress={offlineProgress}
                onContinue={clearOfflineProgress}
            />
        );
    }

    return (
        <GameTickProvider>
            <div className="flex min-h-screen flex-col pb-16">
                <AppHeader />
                <main className="mx-auto w-full max-w-lg flex-1 px-4 py-4">
                    <Outlet />
                </main>
                <TabBar />
            </div>
        </GameTickProvider>
    );
}

function AppLayout(): ReactElement {
    return (
        <GlobalStateProvider>
            <GameSyncProvider>
                <AppContent />
            </GameSyncProvider>
        </GlobalStateProvider>
    );
}
