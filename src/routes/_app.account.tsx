import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGlobalStateProvider } from '@/state/context';
import { Button } from '@/components/ui/Button';
import { displayHigh } from '@/utils/displayHigh';
import { User, LogOut, Save, Loader2, BarChart3 } from 'lucide-react';
import type { ReactElement } from 'react';

export const Route = createFileRoute('/_app/account')({
    component: AccountPage,
});

function AccountPage(): ReactElement {
    const { user, isAuthenticated, logout } = useAuth();
    const { state } = useGlobalStateProvider();
    const [publicName, setPublicName] = useState(user?.publicName ?? '');
    const [hackerAlias, setHackerAlias] = useState(user?.hackerAlias ?? '');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const totalIncomeSources = state.incomeTypes.reduce(
        (sum, income) => sum + income.inventory,
        0,
    );
    const totalHardwareLevels = state.hardware.reduce(
        (sum, hw) => sum + hw.level,
        0,
    );

    async function handleSave(): Promise<void> {
        setSaving(true);
        try {
            await fetch('/api/account/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ publicName, hackerAlias }),
                credentials: 'include',
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } finally {
            setSaving(false);
        }
    }

    async function handleLogout(): Promise<void> {
        await logout();
        window.location.href = '/login';
    }

    if (!isAuthenticated) {
        return (
            <div className="py-8 text-center">
                <User className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
                <h2 className="mb-2 text-lg font-semibold">Not signed in</h2>
                <p className="mb-4 text-gray-500">
                    Sign in to save progress across devices
                </p>
                <Button onClick={() => (window.location.href = '/login')}>
                    Sign In
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-bold">Account</h1>

            <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lime-100 dark:bg-lime-900/30">
                        <User className="h-6 w-6 text-lime-600 dark:text-lime-400" />
                    </div>
                    <div>
                        <div className="font-semibold">{user?.name}</div>
                        <div className="text-sm text-gray-500">
                            {user?.email}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label
                            htmlFor="publicName"
                            className="mb-1 block text-sm font-medium"
                        >
                            Public Name
                        </label>
                        <input
                            id="publicName"
                            type="text"
                            value={publicName}
                            onChange={(e) => setPublicName(e.target.value)}
                            placeholder="How others see you"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="hackerAlias"
                            className="mb-1 block text-sm font-medium"
                        >
                            Hacker Alias
                        </label>
                        <input
                            id="hackerAlias"
                            type="text"
                            value={hackerAlias}
                            onChange={(e) => setHackerAlias(e.target.value)}
                            placeholder="Your underground name"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
                        />
                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : saved ? (
                            'Saved!'
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Profile
                            </>
                        )}
                    </Button>
                </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-lime-600 dark:text-lime-400" />
                    <h2 className="font-semibold">Stats</h2>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md bg-gray-50 p-2 dark:bg-gray-700/50">
                        <div className="text-gray-500 dark:text-gray-400">
                            Hacks Completed
                        </div>
                        <div className="font-semibold">
                            {state.totalHacksCompleted}
                        </div>
                    </div>
                    <div className="rounded-md bg-gray-50 p-2 dark:bg-gray-700/50">
                        <div className="text-gray-500 dark:text-gray-400">
                            Income Sources
                        </div>
                        <div className="font-semibold">
                            {totalIncomeSources}
                        </div>
                    </div>
                    <div className="rounded-md bg-gray-50 p-2 dark:bg-gray-700/50">
                        <div className="text-gray-500 dark:text-gray-400">
                            Hardware Upgrades
                        </div>
                        <div className="font-semibold">
                            {totalHardwareLevels}
                        </div>
                    </div>
                    <div className="rounded-md bg-gray-50 p-2 dark:bg-gray-700/50">
                        <div className="text-gray-500 dark:text-gray-400">
                            Total Earned
                        </div>
                        <div className="font-semibold text-green-600 dark:text-green-400">
                            ${displayHigh(state.totalEarned)}
                        </div>
                    </div>
                    <div className="col-span-2 rounded-md bg-gray-50 p-2 dark:bg-gray-700/50">
                        <div className="text-gray-500 dark:text-gray-400">
                            Total Spent
                        </div>
                        <div className="font-semibold text-red-600 dark:text-red-400">
                            ${displayHigh(state.totalSpent)}
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </section>
        </div>
    );
}
