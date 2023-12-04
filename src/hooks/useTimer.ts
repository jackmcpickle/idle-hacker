import { IncomeType } from '@/models/IncomeType';
import { collectIncome } from '@/state/actions';
import { useGlobalStateProvider } from '@/state/context';
import { useEffect, useState } from 'react';
import { useInterval } from 'react-use';

export const INTERVAL = 100;

export function useTimer(incomeType: IncomeType) {
    const [time, setTime] = useState(0);
    const { dispatch } = useGlobalStateProvider();

    useInterval(
        () => {
            time < incomeType.getCountdown()
                ? setTime(time + INTERVAL)
                : setTime(0);
        },
        incomeType.hasInventory() ? INTERVAL : null
    );

    useEffect(() => {
        if (time >= incomeType.getCountdown()) {
            dispatch(collectIncome(incomeType.getIncome().real()));
        }
    }, [incomeType, time]);

    return {
        time,
        // if under 1sec just show at 100%
        percent: incomeType.isFastCountdown()
            ? 100
            : (time / incomeType.getCountdown()) * 100,
    };
}
