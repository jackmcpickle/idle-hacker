import { Link, useMatchRoute } from '@tanstack/react-router';
import {
    Banknote,
    Cpu,
    Skull,
    Settings,
    User,
    type LucideIcon,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ReactElement } from 'react';

type TabItem = {
    to: string;
    label: string;
    icon: LucideIcon;
};

const tabs: TabItem[] = [
    { to: '/income', label: 'Income', icon: Banknote },
    { to: '/hardware', label: 'Hardware', icon: Cpu },
    { to: '/hack', label: 'Hack', icon: Skull },
    { to: '/settings', label: 'Settings', icon: Settings },
    { to: '/account', label: 'Account', icon: User },
];

export function TabBar(): ReactElement {
    const matchRoute = useMatchRoute();

    return (
        <nav className="fixed right-0 bottom-0 left-0 border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
            <div className="mx-auto flex max-w-lg justify-around">
                {tabs.map((tab) => {
                    const isActive = matchRoute({ to: tab.to, fuzzy: true });
                    return (
                        <Link
                            key={tab.to}
                            to={tab.to}
                            className={cn(
                                'flex flex-1 flex-col items-center py-3 text-xs transition-colors',
                                isActive
                                    ? 'text-lime-600 dark:text-lime-400'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                            )}
                        >
                            <tab.icon
                                className={cn(
                                    'mb-1 h-5 w-5',
                                    isActive && 'stroke-[2.5]',
                                )}
                            />
                            <span>{tab.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
