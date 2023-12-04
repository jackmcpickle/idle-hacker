import { IncomeType } from '@/models/IncomeType';
import {
    CHANGE_PURCHASE_MULTIPLIER,
    COLLECT_INCOME,
    INCREASE_QTY,
} from '@/state/actions';
import {
    CreditCardIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
    GlobeAltIcon,
} from '@heroicons/react/24/solid';

export type GameContext = typeof INITIAL_GAME_STATE;

export interface IncomeAction {
    type: string;
    data?: any;
}

export const INCOME_TYPES = [
    new IncomeType({
        name: 'Business Cards',
        cost: 10,
        income: 5,
        countdown: 5000,
        inventory: 1,
        unlockIncome: 0,
        icon: CreditCardIcon,
    }),
    new IncomeType({
        name: 'Resume Updates',
        cost: 50,
        income: 10,
        countdown: 10000,
        unlockIncome: 1000,
        icon: DocumentTextIcon,
    }),
    new IncomeType({
        name: 'Basic Website',
        cost: 100,
        income: 50,
        countdown: 60000,
        unlockIncome: 100000,
        icon: GlobeAltIcon,
    }),
    new IncomeType({
        name: 'E-commerce site',
        cost: 1000,
        income: 500,
        countdown: 120000,
        unlockIncome: 10000000,
        icon: CurrencyDollarIcon,
    }),
];

export const INITIAL_GAME_STATE = {
    name: 'Jack',
    bank: 0,
    purchaseMultiplier: {
        value: '1',
        isPercent: false,
    },
    incomeTypes: INCOME_TYPES,
};

export const gameReducer = (
    state: GameContext,
    { type, data }: IncomeAction
) => {
    switch (type) {
        case COLLECT_INCOME: {
            return { ...state, bank: state.bank + data };
        }
        case INCREASE_QTY: {
            const incomeType = state.incomeTypes.find(
                (type) => type.name === data.name
            );
            if (!incomeType) return state;
            incomeType.addInventory(data.qty);
            const cost = incomeType.getCost() * data.qty;
            return {
                ...state,
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
