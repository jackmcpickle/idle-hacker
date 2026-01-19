import { createFileRoute, useSearch } from '@tanstack/react-router';
import { useState } from 'react';
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
    const { error: urlError } = useSearch({ from: '/_auth/login' });
    const { sendMagicLink } = useAuth();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>(
        'idle',
    );
    const [error, setError] = useState<string | null>(null);

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

    if (status === 'sent') {
        return (
            <div className="rounded-lg bg-white p-6 text-center shadow dark:bg-gray-800">
                <Mail className="mx-auto mb-4 h-12 w-12 text-lime-600 dark:text-lime-400" />
                <h2 className="mb-2 text-xl font-semibold">Check your email</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    We sent a sign-in link to{' '}
                    <span className="font-medium">{email}</span>
                </p>
                <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="mt-4 text-sm text-lime-600 hover:underline dark:text-lime-400"
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
