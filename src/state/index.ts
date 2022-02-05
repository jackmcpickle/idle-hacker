import { INCOME_TYPES } from '@/models/incomes';
import { CHANGE_PURCHASE_MULTIPLIER, COLLECT_INCOME, INCREASE_QTY } from '@/state/actions';
import { roundHigh } from '@/utils/round';

export type GameContext = typeof INITIAL_GAME_STATE;

export interface IncomeAction {
    type: string;
    data?: any;
}

export const INITIAL_GAME_STATE = {
    name: 'Jack',
    bank: 0,
    purchaseMultiplier: {
        value: '1',
        isPercent: false,
    },
    incomeTypes: INCOME_TYPES,
};

export const gameReducer = (state: GameContext, { type, data }: IncomeAction) => {
    switch (type) {
        case COLLECT_INCOME: {
            return { ...state, bank: roundHigh(state.bank + data) };
        }
        case INCREASE_QTY: {
            const incomeType = state.incomeTypes.find((type) => type.name === data.name);
            incomeType.addInventory(data.qty);
            const cost = roundHigh(incomeType.getCost() * data.qty);
            return {
                ...state,
                bank: roundHigh(state.bank - cost),
            };
        }
        case CHANGE_PURCHASE_MULTIPLIER:
            return {
                ...state,
                purchaseMultiplier: data,
            };
        default:
            return state;
    }
};
