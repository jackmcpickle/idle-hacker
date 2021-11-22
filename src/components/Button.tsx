import * as React from 'react';
import { INTERVAL, useTimer } from '../hooks/useTimer';

export const Button: React.FC<ButtonProps> = ({ cost, income, countdown, total, children, onClick }) => {
    const { time } = useTimer(countdown);

    return (
        <button
            disabled={total < cost}
            onClick={onClick}
            className="relative inline-flex items-center mx-auto mt-16 text-white bg-red-200 border-0 py-2 px-8 focus:outline-none rounded text-lg w-full group"
        >
            <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden h-full text-xs flex bg-red-200 group-hover:bg-red-300">
                <div
                    style={{ width: `${time/countdown}%` }}
                    className="
        shadow-none
        flex flex-col
        text-center
        whitespace-nowrap
        text-white
        justify-center
        bg-red-500
        group-hover:bg-red-600
      "
                ></div>
            </div>
            <div className="relative z-1">{children}{time}{countdown}</div>
            <svg
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="w-4 h-4 ml-1 relative z-1"
                viewBox="0 0 24 24"
            >
                <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
        </button>
    );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    cost: number;
    income: number;
    total: number;
    countdown: number;
}
