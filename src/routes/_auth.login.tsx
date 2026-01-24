import {
    createFileRoute,
    useSearch,
    useNavigate,
} from '@tanstack/react-router';
import { useState, useRef, type KeyboardEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Mail, Loader2 } from 'lucide-react';
import type { ReactElement } from 'react';

export const Route = createFileRoute('/_auth/login')({
    component: LoginPage,
    validateSearch: (search: Record<string, unknown>) => ({
        error: search.error as string | undefined,
    }),
});

function LoginPage(): ReactElement {
    const navigate = useNavigate();
    const { error: urlError } = useSearch({ from: '/_auth/login' });
    const { sendMagicLink, verifyPin } = useAuth();
    const [email, setEmail] = useState('');
    const [pin, setPin] = useState(['', '', '', '', '', '']);
    const [status, setStatus] = useState<
        'idle' | 'loading' | 'sent' | 'verifying' | 'error'
    >('idle');
    const [error, setError] = useState<string | null>(null);
    const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    async function handleSubmit(e: React.FormEvent): Promise<void> {
        e.preventDefault();
        setStatus('loading');
        setError(null);

        const result = await sendMagicLink(email);
        if (result.success) {
            setStatus('sent');
        } else {
            setStatus('error');
            setError(result.error || 'Failed to send');
        }
    }

    function handlePinChange(index: number, value: string): void {
        if (!/^\d*$/.test(value)) return;

        const newPin = [...pin];
        newPin[index] = value.slice(-1);
        setPin(newPin);

        if (value && index < 5) {
            pinInputRefs.current[index + 1]?.focus();
        }
    }

    function handlePinKeyDown(index: number, e: KeyboardEvent): void {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            pinInputRefs.current[index - 1]?.focus();
        }
    }

    function handlePinPaste(e: React.ClipboardEvent): void {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
        if (pastedData.length === 6) {
            setPin(pastedData.split(''));
            pinInputRefs.current[5]?.focus();
        }
    }

    async function handleVerifyPin(): Promise<void> {
        const pinString = pin.join('');
        if (pinString.length !== 6) return;

        setStatus('verifying');
        setError(null);

        const result = await verifyPin(email, pinString);
        if (result.success) {
            void navigate({ to: '/income' });
        } else {
            setStatus('sent');
            setError(result.error || 'Invalid code');
        }
    }

    if (status === 'sent' || status === 'verifying') {
        const pinComplete = pin.every((digit) => digit !== '');

        return (
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                <Mail className="mx-auto mb-4 h-12 w-12 text-lime-600 dark:text-lime-400" />
                <h2 className="mb-2 text-center text-xl font-semibold">
                    Check your email
                </h2>
                <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
                    We sent a sign-in link to{' '}
                    <span className="font-medium">{email}</span>
                </p>

                <div className="mb-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                    <p className="mb-3 text-center text-sm text-gray-600 dark:text-gray-400">
                        Or enter the 6-digit code from your email
                    </p>
                    {error && (
                        <div className="mb-3 rounded bg-red-100 p-2 text-center text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            {error}
                        </div>
                    )}
                    <div className="mb-4 flex justify-center gap-2">
                        {pin.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => {
                                    pinInputRefs.current[index] = el;
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) =>
                                    handlePinChange(index, e.target.value)
                                }
                                onKeyDown={(e) => handlePinKeyDown(index, e)}
                                onPaste={handlePinPaste}
                                className="h-12 w-10 rounded-md border border-gray-300 text-center text-xl font-bold focus:border-lime-500 focus:ring-1 focus:ring-lime-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
                            />
                        ))}
                    </div>
                    <Button
                        type="button"
                        onClick={handleVerifyPin}
                        disabled={!pinComplete || status === 'verifying'}
                        className="w-full"
                    >
                        {status === 'verifying' ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            'Verify code'
                        )}
                    </Button>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setStatus('idle');
                        setPin(['', '', '', '', '', '']);
                        setError(null);
                    }}
                    className="mt-2 w-full text-center text-sm text-lime-600 hover:underline dark:text-lime-400"
                >
                    Use different email
                </button>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-lg bg-white p-6 shadow dark:bg-gray-800"
        >
            <h2 className="mb-4 text-xl font-semibold">Sign in</h2>
            {(urlError || error) && (
                <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    {urlError === 'invalid_token'
                        ? 'Invalid or expired link'
                        : error}
                </div>
            )}
            <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
            >
                Email
            </label>
            <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hacker@example.com"
                required
                className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
            />
            <Button
                type="submit"
                disabled={status === 'loading'}
                className="w-full"
            >
                {status === 'loading' ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                    </>
                ) : (
                    'Send magic link'
                )}
            </Button>
        </form>
    );
}
