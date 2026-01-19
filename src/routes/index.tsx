import { createFileRoute } from '@tanstack/react-router';
import { App } from '@/components/App';

export const Route = createFileRoute('/')({
    component: Index,
});

function Index(): React.JSX.Element {
    return <App />;
}
