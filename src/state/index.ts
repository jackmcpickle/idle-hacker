import { DEPOSIT, WITHDRAW } from "./actions";

export type GameContext = typeof INITIAL_GAME_STATE;

export interface IncomeAction {
    type: string,
    data?: any
}

export const INITIAL_GAME_STATE = {
    name: 'Jack',
    bank: 0,
};

export const gameReducer = (state: GameContext, { type, data }: IncomeAction) => {
    switch (type) {
        case DEPOSIT:
            return { ...state, bank: state.bank + data };
        case WITHDRAW:
            return { ...state, bank: state.bank - data };
        default:
            return state;
    }
}