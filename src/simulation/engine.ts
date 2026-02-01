/**
 * Simulation Engine
 *
 * Core game logic simulation without React dependencies.
 * Mirrors the game's reducer logic for accurate balance testing.
 */

import type { HardwareId } from '@/models/HardwareItem';
import type { HackJobId } from '@/models/HackingJob';
import type {
    SimulationState,
    SimIncomeType,
    SimHardware,
    ProgressionSnapshot,
    StrategyAction,
} from './types';
import type { BalanceConfig, LevelTier } from './config';

/** Create initial simulation state from config */
export function createInitialState(config: BalanceConfig): SimulationState {
    const incomeTypes: SimIncomeType[] = config.incomeTypes.map(
        (inc, index) => ({
            name: inc.name,
            cost: inc.cost,
            income: inc.income,
            countdown: inc.countdown,
            inventory: index === 0 ? 1 : 0, // Start with 1 Business Card
            timeMultiplier: 1,
            incomeMultiplier: 1,
            unlockIncome: inc.unlockIncome,
        }),
    );

    const hardware: SimHardware[] = config.hardware.map((hw) => ({
        id: hw.id,
        name: hw.name,
        baseCost: hw.baseCost,
        speedBonusPerLevel: hw.speedBonusPerLevel,
        maxLevel: hw.maxLevel,
        level: 0,
    }));

    return {
        bank: 0,
        influence: 0,
        totalEarned: 0,
        totalSpent: 0,
        totalHacksCompleted: 0,
        incomeTypes,
        hardware,
        activeHacks: [null],
        maxHackSlots: 1,
        incomeTimers: {},
        globalTick: 0,
    };
}

/** Calculate income per second for current state */
export function calculateIncomePerSecond(
    state: SimulationState,
    _config: BalanceConfig,
): number {
    const speedMultiplier = 1 + getHardwareSpeedBonus(state);

    let totalPerSecond = 0;
    for (const income of state.incomeTypes) {
        if (income.inventory <= 0) continue;
        const incomePerTick =
            income.inventory * income.income * income.incomeMultiplier;
        const effectiveCountdown = Math.max(
            income.countdown / income.timeMultiplier / speedMultiplier,
            1000,
        );
        const ticksPerSecond = 1000 / effectiveCountdown;
        totalPerSecond += incomePerTick * ticksPerSecond;
    }

    return totalPerSecond;
}

/** Get total hardware speed bonus */
export function getHardwareSpeedBonus(state: SimulationState): number {
    return state.hardware.reduce(
        (sum, hw) => sum + hw.level * hw.speedBonusPerLevel,
        0,
    );
}

/** Get hardware cost at current level */
export function getHardwareCost(
    hw: SimHardware,
    config: BalanceConfig,
): number {
    const hwConfig = config.hardware.find((h) => h.id === hw.id);
    if (!hwConfig) return Infinity;
    return Math.floor(
        hwConfig.baseCost * Math.pow(hw.level, hwConfig.costMultiplier),
    );
}

/** Calculate max hack slots based on RAM level */
export function calculateMaxHackSlots(state: SimulationState): number {
    const ram = state.hardware.find((h) => h.id === 'ram');
    const ramLevel = ram?.level ?? 0;
    return 1 + Math.floor(ramLevel / 3);
}

/** Get level multiplier for inventory count */
function getLevelMultiplier(
    inventory: number,
    config: BalanceConfig,
): LevelTier | null {
    for (const tier of config.levelMultipliers) {
        if (inventory >= tier.qty) {
            return tier;
        }
    }
    return null;
}

/** Process a single game tick */
export function processTick(
    state: SimulationState,
    config: BalanceConfig,
    tickMs: number,
): SimulationState {
    const now = state.globalTick + tickMs;
    let newBank = state.bank;
    let newTotalEarned = state.totalEarned;
    let newTotalSpent = state.totalSpent;
    let newTotalHacksCompleted = state.totalHacksCompleted;
    let newInfluence = state.influence;
    const newIncomeTimers = { ...state.incomeTimers };
    const newActiveHacks = [...state.activeHacks];

    const speedMultiplier = 1 + getHardwareSpeedBonus(state);

    // Process income
    for (const income of state.incomeTypes) {
        if (income.inventory <= 0) continue;
        if (newIncomeTimers[income.name] === undefined) {
            newIncomeTimers[income.name] = now;
            continue;
        }
        const lastCollected = newIncomeTimers[income.name];
        const elapsed = now - lastCollected;
        const effectiveCountdown = Math.max(
            income.countdown / income.timeMultiplier / speedMultiplier,
            1000,
        );
        if (elapsed >= effectiveCountdown) {
            const incomeAmount =
                income.inventory * income.income * income.incomeMultiplier;
            newBank += incomeAmount;
            newTotalEarned += incomeAmount;
            newIncomeTimers[income.name] = now;
        }
    }

    // Process hacks
    for (let slot = 0; slot < newActiveHacks.length; slot += 1) {
        const hack = newActiveHacks[slot];
        if (!hack) continue;

        const hackConfig = config.hackJobs.find((h) => h.id === hack.jobId);
        if (!hackConfig) continue;

        const totalCost = hackConfig.cost;
        const remainingCost = totalCost - hack.totalCostPaid;
        const isPaused = newBank <= 0 && remainingCost > 0;

        if (isPaused) {
            // Accumulate paused time
            const pausedDuration = now - hack.lastCostTick;
            newActiveHacks[slot] = {
                ...hack,
                totalPausedMs: hack.totalPausedMs + pausedDuration,
                lastCostTick: now,
            };
        } else {
            const effectiveEndsAt = hack.endsAt + hack.totalPausedMs;

            if (now >= effectiveEndsAt) {
                // Hack completed
                if (remainingCost > 0 && newBank >= remainingCost) {
                    newBank -= remainingCost;
                    newTotalSpent += remainingCost;
                }
                newInfluence += hackConfig.influenceReward;
                newTotalHacksCompleted += 1;
                newActiveHacks[slot] = null;
            } else {
                // Hack in progress - drain cost
                const costPerMs = hackConfig.cost / hackConfig.duration;
                const elapsedSinceLastCost = now - hack.lastCostTick;
                const costToDrain = costPerMs * elapsedSinceLastCost;
                const maxCost = totalCost - hack.totalCostPaid;
                const actualCost = Math.min(costToDrain, maxCost, newBank);
                if (actualCost > 0) {
                    newBank -= actualCost;
                    newTotalSpent += actualCost;
                    newActiveHacks[slot] = {
                        ...hack,
                        totalCostPaid: hack.totalCostPaid + actualCost,
                        lastCostTick: now,
                    };
                }
            }
        }
    }

    return {
        ...state,
        bank: newBank,
        totalEarned: newTotalEarned,
        totalSpent: newTotalSpent,
        totalHacksCompleted: newTotalHacksCompleted,
        influence: newInfluence,
        activeHacks: newActiveHacks,
        globalTick: now,
        incomeTimers: newIncomeTimers,
    };
}

/** Apply a strategy action to the state */
export function applyAction(
    state: SimulationState,
    action: StrategyAction,
    config: BalanceConfig,
): SimulationState {
    switch (action.type) {
        case 'buy_income': {
            const incomeType = state.incomeTypes.find(
                (t) => t.name === action.name,
            );
            if (!incomeType) return state;
            const totalCost = incomeType.cost * action.quantity;
            if (state.bank < totalCost) return state;
            if (
                !incomeType.unlockIncome ||
                state.totalEarned >= incomeType.unlockIncome
            ) {
                // Update inventory and multipliers
                const newInventory = incomeType.inventory + action.quantity;
                const tier = getLevelMultiplier(newInventory, config);
                const newIncomeTypes = state.incomeTypes.map((t) =>
                    t.name === action.name
                        ? {
                              ...t,
                              inventory: newInventory,
                              timeMultiplier: tier?.speed ?? 1,
                              incomeMultiplier: tier?.income ?? 1,
                          }
                        : t,
                );
                return {
                    ...state,
                    bank: state.bank - totalCost,
                    totalSpent: state.totalSpent + totalCost,
                    incomeTypes: newIncomeTypes,
                };
            }
            return state;
        }

        case 'upgrade_hardware': {
            const hw = state.hardware.find((h) => h.id === action.id);
            if (!hw || hw.level >= hw.maxLevel) return state;
            const cost = getHardwareCost(hw, config);
            if (state.bank < cost) return state;

            const newHardware = state.hardware.map((h) =>
                h.id === action.id ? { ...h, level: h.level + 1 } : h,
            );
            const newState = {
                ...state,
                bank: state.bank - cost,
                totalSpent: state.totalSpent + cost,
                hardware: newHardware,
            };
            const newMaxSlots = calculateMaxHackSlots(newState);
            const newActiveHacks = [...newState.activeHacks];
            while (newActiveHacks.length < newMaxSlots) {
                newActiveHacks.push(null);
            }
            return {
                ...newState,
                maxHackSlots: newMaxSlots,
                activeHacks: newActiveHacks,
            };
        }

        case 'start_hack': {
            const { jobId, slot } = action;
            if (slot >= state.maxHackSlots || state.activeHacks[slot])
                return state;

            const hackConfig = config.hackJobs.find((h) => h.id === jobId);
            if (!hackConfig) return state;

            // Check hardware requirements
            for (const [hwId, reqLevel] of Object.entries(
                hackConfig.requiredHardware,
            )) {
                const hw = state.hardware.find((h) => h.id === hwId);
                if (!hw || hw.level < (reqLevel ?? 0)) return state;
            }

            const now = state.globalTick;
            const newActiveHacks = [...state.activeHacks];
            newActiveHacks[slot] = {
                jobId,
                startedAt: now,
                endsAt: now + hackConfig.duration,
                totalCostPaid: 0,
                lastCostTick: now,
                totalPausedMs: 0,
            };
            return {
                ...state,
                activeHacks: newActiveHacks,
            };
        }

        case 'wait':
            return state;
    }
}

/** Take a snapshot of the current state for analysis */
export function takeSnapshot(
    state: SimulationState,
    config: BalanceConfig,
): ProgressionSnapshot {
    const hardwareLevels = Object.fromEntries(
        state.hardware.map((h) => [h.id, h.level]),
    ) as Record<HardwareId, number>;

    return {
        tick: state.globalTick,
        elapsedMs: state.globalTick,
        bank: state.bank,
        influence: state.influence,
        totalEarned: state.totalEarned,
        totalSpent: state.totalSpent,
        incomePerSecond: calculateIncomePerSecond(state, config),
        totalInventory: state.incomeTypes.reduce(
            (sum, t) => sum + t.inventory,
            0,
        ),
        hardwareLevels,
        activeHackCount: state.activeHacks.filter((h) => h !== null).length,
        totalHacksCompleted: state.totalHacksCompleted,
    };
}

/** Check if an income type is unlocked */
export function isIncomeUnlocked(
    income: SimIncomeType,
    totalEarned: number,
): boolean {
    return income.unlockIncome <= totalEarned;
}

/** Check if a hack can be started */
export function canStartHack(
    state: SimulationState,
    hackId: HackJobId,
    config: BalanceConfig,
): boolean {
    const hackConfig = config.hackJobs.find((h) => h.id === hackId);
    if (!hackConfig) return false;

    // Check hardware requirements
    for (const [hwId, reqLevel] of Object.entries(
        hackConfig.requiredHardware,
    )) {
        const hw = state.hardware.find((h) => h.id === hwId);
        if (!hw || hw.level < (reqLevel ?? 0)) return false;
    }

    // Check if there's an available slot
    return state.activeHacks.some((h) => h === null);
}

/** Get available hack slot index, or -1 if none */
export function getAvailableHackSlot(state: SimulationState): number {
    return state.activeHacks.findIndex((h) => h === null);
}
