import * as React from 'react';
import { INCOME_TYPES } from '../models/incomes';
import { spendToGain } from '../state/actions';
import { useGlobalStateProvider } from '../state/context';
import { Button } from './Button';

export const Income = () => {
    const { total, dispatch } = useGlobalStateProvider();

    const incomes = INCOME_TYPES.map(({ cost, income, name, countdown }, index) => (
        <div className="xl:w-1/3 md:w-1/2 p-4" key={index}>
            <div className="border border-gray-200 p-6 rounded-lg">
                <h2 className="text-lg text-gray-900 font-medium title-font mb-2">{name}</h2>
                <p>Increase by ${income}</p>
                <p>
                    <Button
                        cost={cost}
                        total={total}
                        income={income}
                        countdown={countdown}
                        onClick={() => dispatch(spendToGain({ cost, income }))}
                    >
                        ${cost}
                    </Button>
                </p>
            </div>
        </div>
    ));

    return <div className="flex flex-wrap -m-4">{incomes}</div>;
};
