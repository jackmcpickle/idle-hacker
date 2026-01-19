import { createFileRoute, Outlet } from '@tanstack/react-router';
import { GlobalStateProvider } from '@/state/context';
import { AppHeader } from '@/components/layout/AppHeader';
import { TabBar } from '@/components/layout/TabBar';
import type { ReactElement } from 'react';

export const Route = createFileRoute('/_app')({
    component: AppLayout,
});

function AppLayout(): ReactElement {
    return (
        <GlobalStateProvider>
            <div className="flex min-h-screen flex-col pb-16">
                <AppHeader />
                <main className="mx-auto w-full max-w-lg flex-1 px-4 py-4">
                    <Outlet />
                </main>
                <TabBar />
            </div>
        </GlobalStateProvider>
    );
}
