import { IncomeType } from '@/models/IncomeType';
import { HardwareItem, type HardwareId } from '@/models/HardwareItem';
import {
    HackingJob,
    type ActiveHack,
    type HackJobId,
} from '@/models/HackingJob';
import {
    CHANGE_PURCHASE_MULTIPLIER,
    COLLECT_INCOME,
    INCREASE_QTY,
    UPGRADE_HARDWARE,
    START_HACK,
    COMPLETE_HACK,
    LOAD_STATE,
} from '@/state/actions';
import { CircleDollarSign, CreditCard, FileText, Globe } from 'lucide-react';

export type GameContext = {
    name: string;
    bank: number;
    influence: number;
    totalEarned: number;
    purchaseMultiplier: { value: string; isPercent: boolean };
    incomeTypes: IncomeType[];
    hardware: HardwareItem[];
    activeHacks: (ActiveHack | null)[];
    maxHackSlots: number;
    lastSyncedAt: number;
};

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

type UpgradeHardwareAction = {
    type: typeof UPGRADE_HARDWARE;
    data: HardwareId;
};

type StartHackAction = {
    type: typeof START_HACK;
    data: { jobId: HackJobId; slot: number };
};

type CompleteHackAction = {
    type: typeof COMPLETE_HACK;
    data: number;
};

type LoadStateAction = {
    type: typeof LOAD_STATE;
    data: unknown;
};

export type GameAction =
    | CollectIncomeAction
    | IncreaseQtyAction
    | ChangePurchaseMultiplierAction
    | UpgradeHardwareAction
    | StartHackAction
    | CompleteHackAction
    | LoadStateAction;

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

export const INITIAL_GAME_STATE: GameContext = {
    name: 'Hacker',
    bank: 0,
    influence: 0,
    totalEarned: 0,
    purchaseMultiplier: {
        value: '1',
        isPercent: false,
    },
    incomeTypes: INCOME_TYPES,
    hardware: HardwareItem.createAll(),
    activeHacks: [null],
    maxHackSlots: 1,
    lastSyncedAt: Date.now(),
};

function calculateMaxHackSlots(hardware: HardwareItem[]): number {
    const ram = hardware.find((h) => h.id === 'ram');
    const ramLevel = ram?.level ?? 0;
    return 1 + Math.floor(ramLevel / 3);
}

export const gameReducer = (
    state: GameContext,
    action: GameAction,
): GameContext => {
    switch (action.type) {
        case COLLECT_INCOME: {
            return {
                ...state,
                bank: state.bank + action.data,
                totalEarned: state.totalEarned + action.data,
            };
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
        case UPGRADE_HARDWARE: {
            const hw = state.hardware.find((h) => h.id === action.data);
            if (!hw || !hw.canUpgrade()) return state;
            const cost = hw.getCost();
            if (state.bank < cost) return state;
            hw.upgrade();
            const newMaxSlots = calculateMaxHackSlots(state.hardware);
            const newActiveHacks = [...state.activeHacks];
            while (newActiveHacks.length < newMaxSlots) {
                newActiveHacks.push(null);
            }
            return {
                ...state,
                bank: state.bank - cost,
                maxHackSlots: newMaxSlots,
                activeHacks: newActiveHacks,
            };
        }
        case START_HACK: {
            const { jobId, slot } = action.data;
            if (slot >= state.maxHackSlots || state.activeHacks[slot]) {
                return state;
            }
            const job = new HackingJob(jobId);
            if (state.bank < job.cost) return state;
            const hwLevels = Object.fromEntries(
                state.hardware.map((h) => [h.id, h.level]),
            ) as Record<HardwareId, number>;
            if (!job.meetsRequirements(hwLevels)) return state;
            const now = Date.now();
            const newActiveHacks = [...state.activeHacks];
            newActiveHacks[slot] = {
                jobId,
                startedAt: now,
                endsAt: now + job.duration,
            };
            return {
                ...state,
                bank: state.bank - job.cost,
                activeHacks: newActiveHacks,
            };
        }
        case COMPLETE_HACK: {
            const slot = action.data;
            const hack = state.activeHacks[slot];
            if (!hack) return state;
            const job = new HackingJob(hack.jobId);
            const newActiveHacks = [...state.activeHacks];
            newActiveHacks[slot] = null;
            return {
                ...state,
                influence: state.influence + job.influenceReward,
                activeHacks: newActiveHacks,
            };
        }
        case LOAD_STATE: {
            // TODO: deserialize from JSON
            return state;
        }
        default:
            return state;
    }
};
