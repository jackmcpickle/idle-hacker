import { INCOME_TYPES } from '@/models/incomes';
import { CHANGE_PURCHASE_MULTIPLIER, COLLECT_INCOME, INCREASE_QTY } from '@/state/actions';

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
            return { ...state, bank: state.bank + data };
        }
        case INCREASE_QTY: {
            const incomeType = state.incomeTypes.find((type) => type.name === data.name);
            const index = state.incomeTypes.indexOf(incomeType);
            incomeType.addInventory = data.qty;
            const cost = incomeType.getCost() * data.qty;

            console.log('INCREASE_QTY', { cost, incomeType });

            const incomeTypes = [
                ...state.incomeTypes.slice(0, index),
                incomeType,
                ...state.incomeTypes.slice(index + 1),
            ];

            return {
                ...state,
                incomeTypes,
                bank: state.bank - cost,
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
