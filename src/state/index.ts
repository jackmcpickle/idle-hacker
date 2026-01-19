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
    SET_LAST_SYNCED,
    GAME_TICK,
    APPLY_OFFLINE_PROGRESS,
    type OfflineProgressData,
} from '@/state/actions';
import { CircleDollarSign, CreditCard, FileText, Globe } from 'lucide-react';

export type CompletedHack = {
    jobName: string;
    influenceReward: number;
};

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
    incomeTimers: Record<string, number>;
    globalTick: number;
    completedHacks: CompletedHack[];
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

type SetLastSyncedAction = {
    type: typeof SET_LAST_SYNCED;
    data: number;
};

type GameTickAction = {
    type: typeof GAME_TICK;
    data: { now: number };
};

type ApplyOfflineProgressAction = {
    type: typeof APPLY_OFFLINE_PROGRESS;
    data: OfflineProgressData;
};

export type GameAction =
    | CollectIncomeAction
    | IncreaseQtyAction
    | ChangePurchaseMultiplierAction
    | UpgradeHardwareAction
    | StartHackAction
    | CompleteHackAction
    | LoadStateAction
    | SetLastSyncedAction
    | GameTickAction
    | ApplyOfflineProgressAction;

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
    incomeTimers: {},
    globalTick: Date.now(),
    completedHacks: [],
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
                incomeTypes: [...state.incomeTypes],
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
            const newHardware = [...state.hardware];
            const newMaxSlots = calculateMaxHackSlots(newHardware);
            const newActiveHacks = [...state.activeHacks];
            while (newActiveHacks.length < newMaxSlots) {
                newActiveHacks.push(null);
            }
            return {
                ...state,
                bank: state.bank - cost,
                hardware: newHardware,
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
                totalCostPaid: 0,
                lastCostTick: now,
            };
            return {
                ...state,
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
            const loaded = action.data as GameContext | null;
            if (!loaded) return state;
            return loaded;
        }
        case SET_LAST_SYNCED: {
            return {
                ...state,
                lastSyncedAt: action.data,
            };
        }
        case GAME_TICK: {
            const { now } = action.data;
            let newBank = state.bank;
            let newTotalEarned = state.totalEarned;
            let newInfluence = state.influence;
            const newIncomeTimers = { ...state.incomeTimers };
            const newActiveHacks = [...state.activeHacks];
            const completedHacks: CompletedHack[] = [];

            // Calculate total hardware speed bonus
            const hardwareSpeedBonus = state.hardware.reduce(
                (sum, hw) => sum + hw.getSpeedBonus(),
                0,
            );
            const speedMultiplier = 1 + hardwareSpeedBonus;

            // Process income timers
            for (const income of state.incomeTypes) {
                if (!income.hasInventory()) continue;

                // Initialize timer if not set
                if (newIncomeTimers[income.name] === undefined) {
                    newIncomeTimers[income.name] = now;
                    continue;
                }

                const lastCollected = newIncomeTimers[income.name];
                const elapsed = now - lastCollected;
                // Apply hardware speed bonus to countdown
                const countdown = income.getCountdown() / speedMultiplier;

                if (elapsed >= countdown) {
                    const incomeAmount = income.getIncome().real();
                    newBank += incomeAmount;
                    newTotalEarned += incomeAmount;
                    newIncomeTimers[income.name] = now;
                }
            }

            // Process hacks - drain cost per second and auto-complete
            for (let slot = 0; slot < newActiveHacks.length; slot += 1) {
                const hack = newActiveHacks[slot];
                if (!hack) continue;

                const job = new HackingJob(hack.jobId);
                const costPerMs = job.getCostPerSecond() / 1000;

                // Check if hack is complete
                if (now >= hack.endsAt) {
                    // Drain remaining cost
                    const remainingCost = job.getTotalCost() - hack.totalCostPaid;
                    if (remainingCost > 0 && newBank >= remainingCost) {
                        newBank -= remainingCost;
                    }
                    newInfluence += job.influenceReward;
                    completedHacks.push({
                        jobName: job.name,
                        influenceReward: job.influenceReward,
                    });
                    newActiveHacks[slot] = null;
                } else {
                    // Drain cost for elapsed time
                    const elapsedSinceLastCost = now - hack.lastCostTick;
                    const costToDrain = costPerMs * elapsedSinceLastCost;
                    const maxCost = job.getTotalCost() - hack.totalCostPaid;
                    const actualCost = Math.min(costToDrain, maxCost, newBank);

                    if (actualCost > 0) {
                        newBank -= actualCost;
                        newActiveHacks[slot] = {
                            ...hack,
                            totalCostPaid: hack.totalCostPaid + actualCost,
                            lastCostTick: now,
                        };
                    } else if (newBank <= 0) {
                        // Out of money - pause cost drain but keep hack running
                        newActiveHacks[slot] = {
                            ...hack,
                            lastCostTick: now,
                        };
                    }
                }
            }

            // Only create new state if something changed
            if (
                newBank === state.bank &&
                newInfluence === state.influence &&
                completedHacks.length === 0
            ) {
                return {
                    ...state,
                    globalTick: now,
                    incomeTimers: newIncomeTimers,
                    completedHacks: [],
                };
            }

            return {
                ...state,
                bank: newBank,
                totalEarned: newTotalEarned,
                influence: newInfluence,
                activeHacks: newActiveHacks,
                globalTick: now,
                incomeTimers: newIncomeTimers,
                completedHacks,
            };
        }
        case APPLY_OFFLINE_PROGRESS: {
            const {
                earnedWhileAway,
                influenceEarned,
                completedActiveHackSlots,
                hackCostsPaid,
            } = action.data;
            const newActiveHacks = [...state.activeHacks];
            for (const slot of completedActiveHackSlots) {
                newActiveHacks[slot] = null;
            }
            const netEarnings = earnedWhileAway - hackCostsPaid;
            return {
                ...state,
                bank: state.bank + netEarnings,
                totalEarned: state.totalEarned + earnedWhileAway,
                influence: state.influence + influenceEarned,
                activeHacks: newActiveHacks,
            };
        }
        default:
            return state;
    }
};
