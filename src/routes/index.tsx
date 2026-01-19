import { createFileRoute, Link } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Terminal, Zap, Shield, TrendingUp } from 'lucide-react';
import type { ReactElement } from 'react';

export const Route = createFileRoute('/')({
    component: WelcomePage,
});

function WelcomePage(): ReactElement {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (isAuthenticated) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
                <h1 className="text-3xl font-bold">Welcome back!</h1>
                <Link to="/income">
                    <Button size="lg">Continue Playing</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            <header className="flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                    <Terminal className="h-6 w-6 text-lime-500" />
                    <span className="font-mono text-lg font-bold">
                        idle-hacker
                    </span>
                </div>
                <Link to="/login">
                    <Button
                        variant="outline"
                        size="sm"
                    >
                        Login
                    </Button>
                </Link>
            </header>

            <main className="flex flex-1 flex-col items-center justify-center gap-8 p-4 text-center">
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                        Become the ultimate
                        <span className="block text-lime-500">hacker</span>
                    </h1>
                    <p className="mx-auto max-w-md text-gray-600 dark:text-gray-400">
                        Start with business cards. Build your empire. Hack the
                        world.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <Link to="/income">
                        <Button size="lg">Play Now</Button>
                    </Link>
                    <Link to="/login">
                        <Button
                            variant="outline"
                            size="lg"
                        >
                            Login to Save
                        </Button>
                    </Link>
                </div>

                <div className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-3">
                    <FeatureCard
                        icon={TrendingUp}
                        title="Earn Income"
                        description="Build passive income streams from digital services"
                    />
                    <FeatureCard
                        icon={Zap}
                        title="Upgrade Hardware"
                        description="Boost your speed with better CPU, RAM, and network"
                    />
                    <FeatureCard
                        icon={Shield}
                        title="Hack Jobs"
                        description="Complete hacking contracts to earn influence"
                    />
                </div>
            </main>

            <footer className="p-4 text-center text-sm text-gray-500">
                An idle clicker game
            </footer>
        </div>
    );
}

function FeatureCard({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof Terminal;
    title: string;
    description: string;
}): ReactElement {
    return (
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <Icon className="mx-auto mb-2 h-8 w-8 text-lime-500" />
            <h3 className="font-medium">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
    );
}
