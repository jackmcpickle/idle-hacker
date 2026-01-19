import {
    createContext,
    useContext,
    useState,
    useCallback,
    type ReactElement,
    type ReactNode,
} from 'react';
import { Toast, type ToastData } from '@/components/ui/Toast';

type ToastContextValue = {
    showToast: (message: string, subMessage?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({
    children,
}: {
    children: ReactNode;
}): ReactElement {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const showToast = useCallback((message: string, subMessage?: string) => {
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, message, subMessage }]);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="pointer-events-none fixed top-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        toast={toast}
                        onDismiss={dismissToast}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return ctx;
}
