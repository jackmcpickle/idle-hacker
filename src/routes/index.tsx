import { createFileRoute } from '@tanstack/react-router';
import { App } from '@/components/App';
import type { ReactElement } from 'react';

export const Route = createFileRoute('/')({
    component: Index,
});

function Index(): ReactElement {
    return <App />;
}
