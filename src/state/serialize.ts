import { IncomeType } from '@/models/IncomeType';
import { HardwareItem, type HardwareId } from '@/models/HardwareItem';
import type { ActiveHack } from '@/models/HackingJob';
import type { GameContext } from '.';
import { INCOME_TYPES, INITIAL_GAME_STATE } from '.';

type SerializedState = {
    bank: number;
    influence: number;
    totalEarned: number;
    totalSpent: number;
    totalHacksCompleted: number;
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
    incomeTimers: Record<string, number>;
};

const STORAGE_KEY = 'idle-hacker-save';

export function serializeState(state: GameContext): SerializedState {
    return {
        bank: state.bank,
        influence: state.influence,
        totalEarned: state.totalEarned,
        totalSpent: state.totalSpent,
        totalHacksCompleted: state.totalHacksCompleted,
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
        incomeTimers: state.incomeTimers,
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

    // Reset income timers to now so progress bars start fresh
    const now = Date.now();
    const resetIncomeTimers: Record<string, number> = {};
    for (const income of incomeTypes) {
        if (income.hasInventory()) {
            resetIncomeTimers[income.name] = now;
        }
    }

    // Migrate active hacks to add totalPausedMs for existing saves
    const migratedActiveHacks = (saved.activeHacks ?? [null]).map((hack) =>
        hack ? { ...hack, totalPausedMs: hack.totalPausedMs ?? 0 } : null,
    );

    return {
        name: INITIAL_GAME_STATE.name,
        bank: saved.bank ?? 0,
        influence: saved.influence ?? 0,
        totalEarned: saved.totalEarned ?? 0,
        totalSpent: saved.totalSpent ?? 0,
        totalHacksCompleted: saved.totalHacksCompleted ?? 0,
        purchaseMultiplier: saved.purchaseMultiplier ?? {
            value: '1',
            isPercent: false,
        },
        incomeTypes,
        hardware,
        activeHacks: migratedActiveHacks,
        maxHackSlots: saved.maxHackSlots ?? 1,
        lastSyncedAt: saved.lastSyncedAt ?? Date.now(),
        incomeTimers: resetIncomeTimers,
        globalTick: now,
        completedHacks: [],
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

import { HackingJob, type HackJobId } from '@/models/HackingJob';

export type OfflineProgress = {
    earnedWhileAway: number;
    influenceEarned: number;
    completedHackJobIds: HackJobId[];
    completedActiveHackSlots: number[];
    hackCostsPaid: number;
};

export function calculateOfflineProgress(
    state: GameContext,
    lastActiveAt: number,
): OfflineProgress {
    const now = Date.now();
    const elapsedMs = now - lastActiveAt;

    if (elapsedMs <= 0) {
        return {
            earnedWhileAway: 0,
            influenceEarned: 0,
            completedHackJobIds: [],
            completedActiveHackSlots: [],
            hackCostsPaid: 0,
        };
    }

    // Calculate hardware speed bonus
    const hardwareSpeedBonus = state.hardware.reduce(
        (sum, hw) => sum + hw.getSpeedBonus(),
        0,
    );
    const speedMultiplier = 1 + hardwareSpeedBonus;

    // Calculate passive income earned while away
    let earnedWhileAway = 0;

    for (const income of state.incomeTypes) {
        if (income.inventory <= 0) continue;

        // Apply hardware speed bonus to countdown
        const adjustedCountdown = income.getCountdown() / speedMultiplier;
        const incomePerMs = income.getIncome().real() / adjustedCountdown;
        const passiveEarnings = incomePerMs * elapsedMs;
        earnedWhileAway += passiveEarnings;
    }

    // Cap at reasonable amount (max 8 hours of offline progress)
    const maxOfflineMs = 8 * 60 * 60 * 1000;
    if (elapsedMs > maxOfflineMs) {
        earnedWhileAway *= maxOfflineMs / elapsedMs;
    }

    // Calculate completed hacks and hack costs
    let influenceEarned = 0;
    let hackCostsPaid = 0;
    const completedHackJobIds: HackJobId[] = [];
    const completedActiveHackSlots: number[] = [];

    for (let slot = 0; slot < state.activeHacks.length; slot += 1) {
        const hack = state.activeHacks[slot];
        if (!hack) continue;

        const job = new HackingJob(hack.jobId);
        const costPerMs = job.getCostPerSecond() / 1000;
        const totalCost = job.getTotalCost();
        const remainingCost = totalCost - hack.totalCostPaid;

        // Skip unpaid hacks if insufficient offline earnings (conservative)
        if (remainingCost > earnedWhileAway) {
            continue;
        }

        const effectiveEndsAt = hack.endsAt + hack.totalPausedMs;

        if (now >= effectiveEndsAt) {
            // Hack completed - pay remaining cost
            hackCostsPaid += remainingCost;
            influenceEarned += job.influenceReward;
            completedHackJobIds.push(hack.jobId);
            completedActiveHackSlots.push(slot);
        } else {
            // Hack still running - pay elapsed cost
            const elapsedSinceLastCost = now - hack.lastCostTick;
            const costToDrain = costPerMs * elapsedSinceLastCost;
            hackCostsPaid += Math.min(costToDrain, remainingCost);
        }
    }

    return {
        earnedWhileAway: Math.floor(earnedWhileAway),
        influenceEarned,
        completedHackJobIds,
        completedActiveHackSlots,
        hackCostsPaid: Math.floor(hackCostsPaid),
    };
}
