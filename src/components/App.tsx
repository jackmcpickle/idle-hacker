import React from 'react';
import { GlobalStateProvider } from '@/state/context';
import { Header } from '@/components/Header';
import { IncomeList } from '@/components/IncomeList';

export const App = () => {
    return (
        <React.StrictMode>
            <GlobalStateProvider>
                <Header />
                <section className="text-gray-600 body-font">
                    <div className="container px-5 py-24 mx-auto">
                        <IncomeList />
                    </div>
                </section>
            </GlobalStateProvider>
        </React.StrictMode>
    );
};
