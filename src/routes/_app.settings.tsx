import { createFileRoute } from '@tanstack/react-router';
import { useSettings } from '@/contexts/SettingsContext';
import { useGlobalStateProvider } from '@/state/context';
import { Button } from '@/components/ui/Button';
import {
    Sun,
    Moon,
    Monitor,
    Volume2,
    VolumeX,
    Bell,
    BellOff,
    Download,
    Trash2,
    RefreshCw,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ReactElement } from 'react';

export const Route = createFileRoute('/_app/settings')({
    component: SettingsPage,
});

function SettingsPage(): ReactElement {
    const {
        theme,
        setTheme,
        soundEnabled,
        setSoundEnabled,
        notificationsEnabled,
        setNotificationsEnabled,
        numberFormat,
        setNumberFormat,
    } = useSettings();
    const { state } = useGlobalStateProvider();

    function handleExport(): void {
        const data = JSON.stringify(state, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `idle-hacker-save-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function handleReset(): void {
        // eslint-disable-next-line no-alert
        if (window.confirm('Reset all progress? This cannot be undone.')) {
            localStorage.removeItem('idle-hacker-state');
            window.location.reload();
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-bold">Settings</h1>

            <section>
                <h2 className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Theme
                </h2>
                <div className="flex gap-2">
                    {[
                        { value: 'light', icon: Sun, label: 'Light' },
                        { value: 'dark', icon: Moon, label: 'Dark' },
                        { value: 'system', icon: Monitor, label: 'System' },
                    ].map(({ value, icon: Icon, label }) => (
                        <button
                            type="button"
                            key={value}
                            onClick={() =>
                                setTheme(value as 'light' | 'dark' | 'system')
                            }
                            className={cn(
                                'flex flex-1 flex-col items-center gap-1 rounded-lg border p-3 transition-colors',
                                theme === value
                                    ? 'border-lime-500 bg-lime-50 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400'
                                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700',
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="text-xs">{label}</span>
                        </button>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Preferences
                </h2>
                <div className="space-y-2">
                    <button
                        type="button"
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                    >
                        <div className="flex items-center gap-3">
                            {soundEnabled ? (
                                <Volume2 className="h-5 w-5" />
                            ) : (
                                <VolumeX className="h-5 w-5 text-gray-400" />
                            )}
                            <span>Sound Effects</span>
                        </div>
                        <span
                            className={cn(
                                'text-sm',
                                soundEnabled
                                    ? 'text-lime-600'
                                    : 'text-gray-400',
                            )}
                        >
                            {soundEnabled ? 'ON' : 'OFF'}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setNotificationsEnabled(!notificationsEnabled)
                        }
                        className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                    >
                        <div className="flex items-center gap-3">
                            {notificationsEnabled ? (
                                <Bell className="h-5 w-5" />
                            ) : (
                                <BellOff className="h-5 w-5 text-gray-400" />
                            )}
                            <span>Notifications</span>
                        </div>
                        <span
                            className={cn(
                                'text-sm',
                                notificationsEnabled
                                    ? 'text-lime-600'
                                    : 'text-gray-400',
                            )}
                        >
                            {notificationsEnabled ? 'ON' : 'OFF'}
                        </span>
                    </button>
                </div>
            </section>

            <section>
                <h2 className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Number Format
                </h2>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setNumberFormat('short')}
                        className={cn(
                            'flex-1 rounded-lg border p-3 text-center',
                            numberFormat === 'short'
                                ? 'border-lime-500 bg-lime-50 dark:bg-lime-900/30'
                                : 'border-gray-200 dark:border-gray-700',
                        )}
                    >
                        <div className="font-mono text-lg">1.5M</div>
                        <div className="text-xs text-gray-500">Short</div>
                    </button>
                    <button
                        type="button"
                        onClick={() => setNumberFormat('full')}
                        className={cn(
                            'flex-1 rounded-lg border p-3 text-center',
                            numberFormat === 'full'
                                ? 'border-lime-500 bg-lime-50 dark:bg-lime-900/30'
                                : 'border-gray-200 dark:border-gray-700',
                        )}
                    >
                        <div className="font-mono text-lg">1,500,000</div>
                        <div className="text-xs text-gray-500">Full</div>
                    </button>
                </div>
            </section>

            <section>
                <h2 className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Sync
                </h2>
                <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                    <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-gray-500">Last synced</span>
                        <span>
                            {new Date(state.lastSyncedAt).toLocaleTimeString()}
                        </span>
                    </div>
                    <Button
                        variant="outline"
                        className="w-full"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Sync Now
                    </Button>
                </div>
            </section>

            <section>
                <h2 className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Data
                </h2>
                <div className="space-y-2">
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleExport}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export Save
                    </Button>
                    <Button
                        variant="destructive"
                        className="w-full"
                        onClick={handleReset}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Reset Progress
                    </Button>
                </div>
            </section>

            <footer className="pt-4 text-center text-xs text-gray-400">
                Idle Hacker v1.0.0
            </footer>
        </div>
    );
}
