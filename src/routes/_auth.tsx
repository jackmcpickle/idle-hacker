import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Terminal } from 'lucide-react';
import type { ReactElement } from 'react';

export const Route = createFileRoute('/_auth')({
    component: AuthLayout,
});

function AuthLayout(): ReactElement {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
            <div className="mb-8 text-center">
                <Terminal className="mx-auto mb-4 h-16 w-16 text-lime-600 dark:text-lime-400" />
                <h1 className="text-3xl font-bold">Idle Hacker</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Hack the world, one click at a time
                </p>
            </div>
            <div className="w-full max-w-sm">
                <Outlet />
            </div>
        </div>
    );
}
