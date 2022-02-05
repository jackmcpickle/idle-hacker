import { useState } from 'react';
import { useInterval } from 'react-use';

export const INTERVAL = 100;

export function useTimer(countDown: number, hasInventory: boolean) {
    const [time, setTime] = useState(0);

    useInterval(
        () => {
            time < countDown ? setTime(time + INTERVAL) : setTime(0);
        },
        hasInventory ? INTERVAL : null
    );

    return {
        time,
        percent: (time / countDown) * 100,
    };
}
