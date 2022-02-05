import React from 'react';
import { GlobalStateProvider } from '@/state/context';
import { DisplayIncome } from '@/components/DisplayIncome';
import { Header } from '@/components/Header';
import { Income } from '@/components/Income';

export const App = () => {
    return (
        <React.StrictMode>
            <GlobalStateProvider>
                <Header />
                <section className="text-gray-600 body-font">
                    <div className="container px-5 py-24 mx-auto">
                        <DisplayIncome />
                        <Income />
                    </div>
                </section>
            </GlobalStateProvider>
        </React.StrictMode>
    );
};
