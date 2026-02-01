/**
 * AI Strategies for Game Simulation
 *
 * Different strategies for how an AI player would play the game.
 * Used to test balance across different playstyles.
 */

import type { HardwareId } from '@/models/HardwareItem';
import type { HackJobId } from '@/models/HackingJob';
import type { SimulationState, AIStrategy, StrategyAction } from './types';
import type { BalanceConfig } from './config';
import {
    getHardwareCost,
    isIncomeUnlocked,
    canStartHack,
    getAvailableHackSlot,
    calculateIncomePerSecond,
} from './engine';

/** Strategy that always buys the most expensive affordable item */
export function createGreedyStrategy(config: BalanceConfig): AIStrategy {
    return {
        name: 'Greedy',
        description: 'Always buys the most expensive affordable upgrade',
        decide(state: SimulationState): StrategyAction {
            const bank = state.bank;

            // Try to start a hack if possible (free income)
            for (const hackConfig of [...config.hackJobs].reverse()) {
                if (canStartHack(state, hackConfig.id as HackJobId, config)) {
                    const slot = getAvailableHackSlot(state);
                    if (slot >= 0) {
                        return { type: 'start_hack', jobId: hackConfig.id as HackJobId, slot };
                    }
                }
            }

            // Find most expensive affordable option
            let bestAction: StrategyAction = { type: 'wait' };
            let bestCost = 0;

            // Check income types
            for (const income of state.incomeTypes) {
                if (!isIncomeUnlocked(income, state.totalEarned)) continue;
                if (income.cost <= bank && income.cost > bestCost) {
                    bestAction = { type: 'buy_income', name: income.name, quantity: 1 };
                    bestCost = income.cost;
                }
            }

            // Check hardware
            for (const hw of state.hardware) {
                if (hw.level >= hw.maxLevel) continue;
                const cost = getHardwareCost(hw, config);
                if (cost <= bank && cost > bestCost) {
                    bestAction = { type: 'upgrade_hardware', id: hw.id };
                    bestCost = cost;
                }
            }

            return bestAction;
        },
    };
}

/** Strategy that balances between income and hardware upgrades */
export function createBalancedStrategy(config: BalanceConfig): AIStrategy {
    return {
        name: 'Balanced',
        description: 'Balances income purchases with hardware upgrades',
        decide(state: SimulationState): StrategyAction {
            const bank = state.bank;

            // Start hacks when possible
            for (const hackConfig of [...config.hackJobs].reverse()) {
                if (canStartHack(state, hackConfig.id as HackJobId, config)) {
                    const slot = getAvailableHackSlot(state);
                    if (slot >= 0) {
                        return { type: 'start_hack', jobId: hackConfig.id as HackJobId, slot };
                    }
                }
            }

            // Calculate total hardware investment vs income investment
            const totalHardwareSpent = state.hardware.reduce((sum, hw) => {
                let spent = 0;
                for (let l = 0; l < hw.level; l++) {
                    const hwConfig = config.hardware.find((h) => h.id === hw.id);
                    if (hwConfig) {
                        spent += hwConfig.baseCost * Math.pow(hwConfig.costMultiplier, l);
                    }
                }
                return sum + spent;
            }, 0);

            const totalIncomeSpent = state.incomeTypes.reduce(
                (sum, t) => sum + t.inventory * t.cost,
                0,
            );

            // Target 30% hardware, 70% income
            const targetHardwareRatio = 0.3;
            const currentHardwareRatio =
                totalHardwareSpent / (totalHardwareSpent + totalIncomeSpent + 1);

            // If below target hardware ratio, prioritize hardware
            if (currentHardwareRatio < targetHardwareRatio) {
                for (const hw of state.hardware) {
                    if (hw.level >= hw.maxLevel) continue;
                    const cost = getHardwareCost(hw, config);
                    if (cost <= bank) {
                        return { type: 'upgrade_hardware', id: hw.id };
                    }
                }
            }

            // Otherwise, buy income (highest efficiency)
            const efficiencies = state.incomeTypes
                .filter((t) => isIncomeUnlocked(t, state.totalEarned) && t.cost <= bank)
                .map((t) => ({
                    income: t,
                    efficiency: (t.income * t.incomeMultiplier) / t.cost,
                }))
                .sort((a, b) => b.efficiency - a.efficiency);

            if (efficiencies.length > 0) {
                return {
                    type: 'buy_income',
                    name: efficiencies[0].income.name,
                    quantity: 1,
                };
            }

            return { type: 'wait' };
        },
    };
}

/** Strategy focused on maximizing hardware for hacking */
export function createHackFocusedStrategy(config: BalanceConfig): AIStrategy {
    return {
        name: 'HackFocused',
        description: 'Prioritizes hardware upgrades to unlock hacking jobs',
        decide(state: SimulationState): StrategyAction {
            const bank = state.bank;

            // Always start available hacks
            for (const hackConfig of [...config.hackJobs].reverse()) {
                if (canStartHack(state, hackConfig.id as HackJobId, config)) {
                    const slot = getAvailableHackSlot(state);
                    if (slot >= 0) {
                        return { type: 'start_hack', jobId: hackConfig.id as HackJobId, slot };
                    }
                }
            }

            // Find next hack to unlock and what hardware is needed
            const hwLevels = Object.fromEntries(
                state.hardware.map((h) => [h.id, h.level]),
            ) as Record<HardwareId, number>;

            for (const hackConfig of config.hackJobs) {
                let allMet = true;
                let neededHw: HardwareId | null = null;

                for (const [hwId, reqLevel] of Object.entries(hackConfig.requiredHardware)) {
                    if ((hwLevels[hwId as HardwareId] ?? 0) < (reqLevel ?? 0)) {
                        allMet = false;
                        neededHw = hwId as HardwareId;
                        break;
                    }
                }

                if (!allMet && neededHw) {
                    const hw = state.hardware.find((h) => h.id === neededHw);
                    if (hw && hw.level < hw.maxLevel) {
                        const cost = getHardwareCost(hw, config);
                        if (cost <= bank) {
                            return { type: 'upgrade_hardware', id: neededHw };
                        }
                    }
                    // If we can't afford the hardware, buy income to save up
                    break;
                }
            }

            // Buy cheapest available income to keep money flowing
            const affordable = state.incomeTypes
                .filter((t) => isIncomeUnlocked(t, state.totalEarned) && t.cost <= bank)
                .sort((a, b) => a.cost - b.cost);

            if (affordable.length > 0) {
                return { type: 'buy_income', name: affordable[0].name, quantity: 1 };
            }

            return { type: 'wait' };
        },
    };
}

/** Strategy that focuses on building passive income first */
export function createIncomeFirstStrategy(config: BalanceConfig): AIStrategy {
    return {
        name: 'IncomeFirst',
        description: 'Focuses on building passive income before hardware',
        decide(state: SimulationState): StrategyAction {
            const bank = state.bank;

            // Start hacks when possible (they're free influence)
            for (const hackConfig of [...config.hackJobs].reverse()) {
                if (canStartHack(state, hackConfig.id as HackJobId, config)) {
                    const slot = getAvailableHackSlot(state);
                    if (slot >= 0) {
                        return { type: 'start_hack', jobId: hackConfig.id as HackJobId, slot };
                    }
                }
            }

            // Buy income until we hit a good rate, then hardware
            const incomePerSec = calculateIncomePerSecond(state, config);

            // Only buy hardware when income is strong relative to hardware cost
            const cheapestHwCost = Math.min(
                ...state.hardware
                    .filter((h) => h.level < h.maxLevel)
                    .map((h) => getHardwareCost(h, config)),
            );

            // If we can earn hardware cost in < 30 seconds, buy hardware
            if (incomePerSec > 0 && cheapestHwCost / incomePerSec < 30) {
                for (const hw of state.hardware) {
                    if (hw.level >= hw.maxLevel) continue;
                    const cost = getHardwareCost(hw, config);
                    if (cost <= bank) {
                        return { type: 'upgrade_hardware', id: hw.id };
                    }
                }
            }

            // Buy highest-tier affordable income
            const affordable = state.incomeTypes
                .filter((t) => isIncomeUnlocked(t, state.totalEarned) && t.cost <= bank)
                .sort((a, b) => b.cost - a.cost);

            if (affordable.length > 0) {
                return { type: 'buy_income', name: affordable[0].name, quantity: 1 };
            }

            return { type: 'wait' };
        },
    };
}

/** Strategy that plays randomly (for comparison baseline) */
export function createRandomStrategy(config: BalanceConfig, seed?: number): AIStrategy {
    let rng = seed ?? Date.now();
    // eslint-disable-next-line no-bitwise -- RNG algorithm requires bitwise
    function random(): number {
        rng = (rng * 1103515245 + 12345) & 0x7fffffff;
        return rng / 0x7fffffff;
    }

    return {
        name: 'Random',
        description: 'Makes random valid decisions (baseline)',
        decide(state: SimulationState): StrategyAction {
            const bank = state.bank;
            const options: StrategyAction[] = [];

            // Collect all valid options
            for (const hackConfig of config.hackJobs) {
                if (canStartHack(state, hackConfig.id as HackJobId, config)) {
                    const slot = getAvailableHackSlot(state);
                    if (slot >= 0) {
                        options.push({
                            type: 'start_hack',
                            jobId: hackConfig.id as HackJobId,
                            slot,
                        });
                    }
                }
            }

            for (const hw of state.hardware) {
                if (hw.level >= hw.maxLevel) continue;
                const cost = getHardwareCost(hw, config);
                if (cost <= bank) {
                    options.push({ type: 'upgrade_hardware', id: hw.id });
                }
            }

            for (const income of state.incomeTypes) {
                if (!isIncomeUnlocked(income, state.totalEarned)) continue;
                if (income.cost <= bank) {
                    options.push({ type: 'buy_income', name: income.name, quantity: 1 });
                }
            }

            if (options.length === 0) {
                return { type: 'wait' };
            }

            return options[Math.floor(random() * options.length)];
        },
    };
}

/** Get all available strategies */
export function getAllStrategies(config: BalanceConfig): AIStrategy[] {
    return [
        createGreedyStrategy(config),
        createBalancedStrategy(config),
        createHackFocusedStrategy(config),
        createIncomeFirstStrategy(config),
        createRandomStrategy(config, 12345),
    ];
}
