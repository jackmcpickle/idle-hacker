import React from 'react';
import { GlobalStateProvider } from '@/state/context';
import { Header } from '@/components/Header';
import { IncomeList } from '@/components/IncomeList';

export function App(): React.JSX.Element {
    return (
        <React.StrictMode>
            <GlobalStateProvider>
                <Header />
                <section className="body-font text-gray-600">
                    <div className="container mx-auto px-5 py-24">
                        <IncomeList />
                    </div>
                </section>
            </GlobalStateProvider>
        </React.StrictMode>
    );
}
