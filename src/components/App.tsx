import React from 'react';
import { useTimer } from '../hooks/useTimer';
import { GlobalStateProvider } from '../state/context';
import { Header } from './Header';
import { Income } from './Income';

export const App = () => {
    return (
        <GlobalStateProvider>
            <Header />
            <section className="text-gray-600 body-font">
                <div className="container px-5 py-24 mx-auto">
                    <Income />
                </div>
            </section>
        </GlobalStateProvider>
    );
};
