import { IncomeType } from '@/models/IncomeType';
import {
    CHANGE_PURCHASE_MULTIPLIER,
    COLLECT_INCOME,
    INCREASE_QTY,
} from '@/state/actions';
import { CircleDollarSign, CreditCard, FileText, Globe } from 'lucide-react';

export type GameContext = typeof INITIAL_GAME_STATE;

type CollectIncomeAction = {
    type: typeof COLLECT_INCOME;
    data: number;
};

type IncreaseQtyAction = {
    type: typeof INCREASE_QTY;
    data: { name: string; qty: number };
};

type ChangePurchaseMultiplierAction = {
    type: typeof CHANGE_PURCHASE_MULTIPLIER;
    data: { value: string; isPercent: boolean };
};

export type IncomeAction =
    | CollectIncomeAction
    | IncreaseQtyAction
    | ChangePurchaseMultiplierAction;

export const INCOME_TYPES = [
    new IncomeType({
        name: 'Business Cards',
        cost: 10,
        income: 5,
        countdown: 5000,
        inventory: 1,
        unlockIncome: 0,
        icon: CreditCard,
    }),
    new IncomeType({
        name: 'Resume Updates',
        cost: 50,
        income: 10,
        countdown: 10000,
        unlockIncome: 1000,
        icon: FileText,
    }),
    new IncomeType({
        name: 'Basic Website',
        cost: 100,
        income: 50,
        countdown: 60000,
        unlockIncome: 100000,
        icon: Globe,
    }),
    new IncomeType({
        name: 'E-commerce site',
        cost: 1000,
        income: 500,
        countdown: 120000,
        unlockIncome: 10000000,
        icon: CircleDollarSign,
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
    action: IncomeAction,
): GameContext => {
    switch (action.type) {
        case COLLECT_INCOME: {
            return { ...state, bank: state.bank + action.data };
        }
        case INCREASE_QTY: {
            const incomeType = state.incomeTypes.find(
                (type) => type.name === action.data.name,
            );
            if (!incomeType) return state;
            incomeType.addInventory(action.data.qty);
            const cost = incomeType.getCost() * action.data.qty;
            return {
                ...state,
                bank: state.bank - cost,
            };
        }
        case CHANGE_PURCHASE_MULTIPLIER:
            return {
                ...state,
                purchaseMultiplier: action.data,
            };
        default:
            return state;
    }
};
