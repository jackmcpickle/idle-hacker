import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import type { ReactElement } from 'react';

function RootLayout(): ReactElement {
    return (
        <SettingsProvider>
            <AuthProvider>
                <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
                    <Outlet />
                </div>
                <TanStackRouterDevtools />
            </AuthProvider>
        </SettingsProvider>
    );
}

export const Route = createRootRoute({ component: RootLayout });
