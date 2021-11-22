import { useEffect, useState } from 'react';

export const INTERVAL = 50;

export function useTimer(countDown: number) {
    const [time, setTime] = useState(0);

    function tick() {
        if (time < (countDown)) {
            return setTime(time + INTERVAL);
        }
        setTime(0);
    }

    useEffect(() => {
        const interval = setInterval(tick, INTERVAL);
        return () => clearInterval(interval);
    }, [time]);

    return {
        time
    }
}