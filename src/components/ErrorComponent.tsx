import type { ReactElement } from 'react';
import { Button } from './ui/Button';
import { RefreshCw } from 'lucide-react';

interface ErrorComponentProps {
    error: Error;
    reset?: () => void;
}

export function ErrorComponent({
    error,
    reset,
}: ErrorComponentProps): ReactElement {
    return (
        <div className="bg-red-900 text-white">
            <p></p>
            {error.message || 'An unexpected error occurred'}
            {reset && (
                <div className="flex justify-end gap-4">
                    <Button
                        variant="outline"
                        onClick={reset}
                    >
                        <RefreshCw className="mr-2 size-4" />
                        Try again
                    </Button>
                    <Button
                        variant="default"
                        onClick={() => {
                            window.location.reload();
                        }}
                    >
                        <RefreshCw className="mr-2 size-4" />
                        Reload
                    </Button>
                </div>
            )}
        </div>
    );
}
