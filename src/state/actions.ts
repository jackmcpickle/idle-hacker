import type { HardwareId } from '@/models/HardwareItem';
import type { HackJobId } from '@/models/HackingJob';

export const COLLECT_INCOME = 'COLLECT_INCOME';
export const INCREASE_QTY = 'INCREASE_QTY';
export const CHANGE_PURCHASE_MULTIPLIER = 'CHANGE_PURCHASE_MULTIPLIER';
export const UPGRADE_HARDWARE = 'UPGRADE_HARDWARE';
export const START_HACK = 'START_HACK';
export const COMPLETE_HACK = 'COMPLETE_HACK';
export const LOAD_STATE = 'LOAD_STATE';
export const SET_LAST_SYNCED = 'SET_LAST_SYNCED';
export const GAME_TICK = 'GAME_TICK';
export const APPLY_OFFLINE_PROGRESS = 'APPLY_OFFLINE_PROGRESS';
export const RESET_GAME = 'RESET_GAME';
export const CLEAR_COMPLETED_HACKS = 'CLEAR_COMPLETED_HACKS';

export const increaseQty = (
    name: string,
    qty: number,
): { type: typeof INCREASE_QTY; data: { name: string; qty: number } } => ({
    type: INCREASE_QTY,
    data: { name, qty },
});

export const collectIncome = (
    amount: number,
): { type: typeof COLLECT_INCOME; data: number } => ({
    type: COLLECT_INCOME,
    data: amount,
});

export const setPurchaseMultiplier = (
    value: string,
    isPercent: boolean,
): {
    type: typeof CHANGE_PURCHASE_MULTIPLIER;
    data: { value: string; isPercent: boolean };
} => ({
    type: CHANGE_PURCHASE_MULTIPLIER,
    data: { value, isPercent },
});

export const upgradeHardware = (
    id: HardwareId,
): { type: typeof UPGRADE_HARDWARE; data: HardwareId } => ({
    type: UPGRADE_HARDWARE,
    data: id,
});

export const startHack = (
    jobId: HackJobId,
    slot: number,
): { type: typeof START_HACK; data: { jobId: HackJobId; slot: number } } => ({
    type: START_HACK,
    data: { jobId, slot },
});

export const completeHack = (
    slot: number,
): { type: typeof COMPLETE_HACK; data: number } => ({
    type: COMPLETE_HACK,
    data: slot,
});

export const loadState = (
    state: unknown,
): { type: typeof LOAD_STATE; data: unknown } => ({
    type: LOAD_STATE,
    data: state,
});

export const setLastSynced = (
    timestamp: number,
): { type: typeof SET_LAST_SYNCED; data: number } => ({
    type: SET_LAST_SYNCED,
    data: timestamp,
});

export const gameTick = (
    now: number,
): { type: typeof GAME_TICK; data: { now: number } } => ({
    type: GAME_TICK,
    data: { now },
});

export type OfflineProgressData = {
    earnedWhileAway: number;
    influenceEarned: number;
    completedActiveHackSlots: number[];
    hackCostsPaid: number;
};

export const applyOfflineProgress = (
    data: OfflineProgressData,
): { type: typeof APPLY_OFFLINE_PROGRESS; data: OfflineProgressData } => ({
    type: APPLY_OFFLINE_PROGRESS,
    data,
});

export const resetGame = (): { type: typeof RESET_GAME } => ({
    type: RESET_GAME,
});

export const clearCompletedHacks = (): { type: typeof CLEAR_COMPLETED_HACKS } => ({
    type: CLEAR_COMPLETED_HACKS,
});
