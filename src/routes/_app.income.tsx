import { createFileRoute } from '@tanstack/react-router';
import { IncomeList } from '@/components/IncomeList';
import { PurchaseMultiplier } from '@/components/PurchaseMultiplier';
import type { ReactElement } from 'react';

export const Route = createFileRoute('/_app/income')({
    component: IncomePage,
});

function IncomePage(): ReactElement {
    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-xl font-bold">Income Sources</h1>
                <PurchaseMultiplier />
            </div>
            <IncomeList />
        </div>
    );
}
