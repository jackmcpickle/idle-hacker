import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
    type ReactElement,
} from 'react';

type User = {
    id: number;
    name: string;
    email: string;
    publicName: string | null;
    hackerAlias: string | null;
};

type AuthState = {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
};

type AuthContextValue = AuthState & {
    sendMagicLink: (
        email: string,
    ) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    refetchUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
    children,
}: {
    children: ReactNode;
}): ReactElement {
    const [state, setState] = useState<AuthState>({
        user: null,
        isLoading: true,
        isAuthenticated: false,
    });

    const fetchUser = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/me', { credentials: 'include' });
            const data = await res.json();
            setState({
                user: data.user,
                isLoading: false,
                isAuthenticated: !!data.user,
            });
        } catch {
            setState({ user: null, isLoading: false, isAuthenticated: false });
        }
    }, []);

    useEffect(() => {
        void fetchUser();
    }, [fetchUser]);

    async function sendMagicLink(
        email: string,
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const res = await fetch('/api/auth/send-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
                credentials: 'include',
            });
            if (!res.ok) {
                const data = await res.json();
                return {
                    success: false,
                    error: data.error || 'Failed to send',
                };
            }
            return { success: true };
        } catch {
            return { success: false, error: 'Network error' };
        }
    }

    async function handleLogout(): Promise<void> {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } finally {
            setState({ user: null, isLoading: false, isAuthenticated: false });
        }
    }

    return (
        <AuthContext.Provider
            value={{
                ...state,
                sendMagicLink,
                logout: handleLogout,
                refetchUser: fetchUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return ctx;
}
