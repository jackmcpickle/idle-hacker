import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
    type ReactElement,
} from 'react';

type Theme = 'light' | 'dark' | 'system';
type NumberFormat = 'short' | 'full';

type Settings = {
    theme: Theme;
    soundEnabled: boolean;
    notificationsEnabled: boolean;
    numberFormat: NumberFormat;
};

type SettingsContextValue = Settings & {
    setTheme: (theme: Theme) => void;
    setSoundEnabled: (enabled: boolean) => void;
    setNotificationsEnabled: (enabled: boolean) => void;
    setNumberFormat: (format: NumberFormat) => void;
    resolvedTheme: 'light' | 'dark';
};

const STORAGE_KEY = 'idle-hacker-settings';

const defaultSettings: Settings = {
    theme: 'system',
    soundEnabled: true,
    notificationsEnabled: false,
    numberFormat: 'short',
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

function getResolvedTheme(theme: Theme): 'light' | 'dark' {
    if (theme !== 'system') return theme;
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

export function SettingsProvider({
    children,
}: {
    children: ReactNode;
}): ReactElement {
    const [settings, setSettings] = useState<Settings>(() => {
        if (typeof window === 'undefined') return defaultSettings;
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return { ...defaultSettings, ...JSON.parse(stored) };
            } catch {
                return defaultSettings;
            }
        }
        return defaultSettings;
    });

    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() =>
        getResolvedTheme(settings.theme),
    );

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        const resolved = getResolvedTheme(settings.theme);
        setResolvedTheme(resolved);
        document.documentElement.classList.toggle('dark', resolved === 'dark');
    }, [settings.theme]);

    useEffect(() => {
        if (settings.theme !== 'system') return;
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        function handleChange(): void {
            const resolved = getResolvedTheme(settings.theme);
            setResolvedTheme(resolved);
            document.documentElement.classList.toggle(
                'dark',
                resolved === 'dark',
            );
        }
        mq.addEventListener('change', handleChange);
        return () => mq.removeEventListener('change', handleChange);
    }, [settings.theme]);

    function update<K extends keyof Settings>(
        key: K,
        value: Settings[K],
    ): void {
        setSettings((prev) => ({ ...prev, [key]: value }));
    }

    return (
        <SettingsContext.Provider
            value={{
                ...settings,
                resolvedTheme,
                setTheme: (t) => update('theme', t),
                setSoundEnabled: (e) => update('soundEnabled', e),
                setNotificationsEnabled: (e) =>
                    update('notificationsEnabled', e),
                setNumberFormat: (f) => update('numberFormat', f),
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings(): SettingsContextValue {
    const ctx = useContext(SettingsContext);
    if (!ctx) {
        throw new Error('useSettings must be used within SettingsProvider');
    }
    return ctx;
}
