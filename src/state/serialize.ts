import { IncomeType } from '@/models/IncomeType';
import { HardwareItem, type HardwareId } from '@/models/HardwareItem';
import type { ActiveHack } from '@/models/HackingJob';
import type { GameContext } from '.';
import { INCOME_TYPES, INITIAL_GAME_STATE } from '.';

type SerializedState = {
    bank: number;
    influence: number;
    totalEarned: number;
    purchaseMultiplier: { value: string; isPercent: boolean };
    incomeTypes: Array<{
        name: string;
        inventory: number;
    }>;
    hardware: Array<{
        id: HardwareId;
        level: number;
    }>;
    activeHacks: (ActiveHack | null)[];
    maxHackSlots: number;
    lastSyncedAt: number;
};

const STORAGE_KEY = 'idle-hacker-save';

export function serializeState(state: GameContext): SerializedState {
    return {
        bank: state.bank,
        influence: state.influence,
        totalEarned: state.totalEarned,
        purchaseMultiplier: state.purchaseMultiplier,
        incomeTypes: state.incomeTypes.map((inc) => ({
            name: inc.name,
            inventory: inc.inventory,
        })),
        hardware: state.hardware.map((hw) => ({
            id: hw.id,
            level: hw.level,
        })),
        activeHacks: state.activeHacks,
        maxHackSlots: state.maxHackSlots,
        lastSyncedAt: state.lastSyncedAt,
    };
}

export function deserializeState(data: unknown): GameContext | null {
    if (!data || typeof data !== 'object') return null;

    const saved = data as Partial<SerializedState>;

    // Reconstruct income types with saved inventory
    const incomeTypes = INCOME_TYPES.map((template) => {
        const savedIncome = saved.incomeTypes?.find(
            (i) => i.name === template.name,
        );
        const inc = new IncomeType({
            name: template.name,
            cost: template.cost,
            income: template.income,
            countdown: template.countdown,
            unlockIncome: template.unlockIncome,
            icon: template.icon,
            inventory: savedIncome?.inventory ?? template.inventory,
        });
        return inc;
    });

    // Reconstruct hardware with saved levels
    const hardware = HardwareItem.createAll().map((template) => {
        const savedHw = saved.hardware?.find((h) => h.id === template.id);
        if (savedHw) {
            for (let i = 0; i < savedHw.level; i += 1) {
                template.upgrade();
            }
        }
        return template;
    });

    return {
        name: INITIAL_GAME_STATE.name,
        bank: saved.bank ?? 0,
        influence: saved.influence ?? 0,
        totalEarned: saved.totalEarned ?? 0,
        purchaseMultiplier: saved.purchaseMultiplier ?? {
            value: '1',
            isPercent: false,
        },
        incomeTypes,
        hardware,
        activeHacks: saved.activeHacks ?? [null],
        maxHackSlots: saved.maxHackSlots ?? 1,
        lastSyncedAt: saved.lastSyncedAt ?? Date.now(),
    };
}

export function saveToLocalStorage(state: GameContext): void {
    try {
        const serialized = serializeState(state);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
    } catch {
        // localStorage may be unavailable
    }
}

export function loadFromLocalStorage(): GameContext | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;
        const parsed = JSON.parse(stored) as unknown;
        return deserializeState(parsed);
    } catch {
        return null;
    }
}

export function calculateOfflineProgress(
    state: GameContext,
    lastActiveAt: number,
): { earnedWhileAway: number } {
    const now = Date.now();
    const elapsedMs = now - lastActiveAt;

    if (elapsedMs <= 0) return { earnedWhileAway: 0 };

    // Calculate passive income earned while away
    // Only count income sources that auto-collect (countdown passed)
    let earnedWhileAway = 0;

    for (const income of state.incomeTypes) {
        if (income.inventory <= 0) continue;

        // getIncome() already accounts for inventory, so don't multiply again
        const incomePerMs = income.getIncome().real() / income.getCountdown();
        const passiveEarnings = incomePerMs * elapsedMs;
        earnedWhileAway += passiveEarnings;
    }

    // Cap at reasonable amount (max 8 hours of offline progress)
    const maxOfflineMs = 8 * 60 * 60 * 1000;
    if (elapsedMs > maxOfflineMs) {
        earnedWhileAway *= maxOfflineMs / elapsedMs;
    }

    return { earnedWhileAway: Math.floor(earnedWhileAway) };
}
