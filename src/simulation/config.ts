/**
 * Balance Configuration System
 *
 * Tweakable parameters that can be modified between optimization iterations.
 * Imports from shared constants to stay in sync with the game.
 */

import type { HardwareId } from '@/models/HardwareItem';
import type { HackJobId } from '@/models/HackingJob';
import {
    INCOME_BALANCE,
    HARDWARE_BALANCE,
    HACK_JOBS_BALANCE,
    LEVEL_MULTIPLIERS,
} from '@/constants/balance';

/** Income type configuration */
export type IncomeConfig = {
    name: string;
    cost: number;
    income: number;
    countdown: number;
    unlockIncome: number;
};

/** Hardware configuration */
export type HardwareConfig = {
    id: HardwareId;
    name: string;
    baseCost: number;
    costMultiplier: number; // Cost = baseCost * multiplier^level
    speedBonusPerLevel: number;
    maxLevel: number;
};

/** Hack job configuration */
export type HackConfig = {
    id: HackJobId;
    name: string;
    duration: number;
    cost: number;
    influenceReward: number;
    requiredHardware: Partial<Record<HardwareId, number>>;
};

/** Level multiplier tier */
export type LevelTier = {
    qty: number;
    speed: number;
    income: number;
};

/** Complete balance configuration */
export type BalanceConfig = {
    version: number;
    incomeTypes: IncomeConfig[];
    hardware: HardwareConfig[];
    hackJobs: HackConfig[];
    levelMultipliers: LevelTier[];
};

/** Default balance configuration - derived from shared constants */
export const DEFAULT_BALANCE_CONFIG: BalanceConfig = {
    version: 1,
    incomeTypes: INCOME_BALANCE.map((inc) => ({
        name: inc.name,
        cost: inc.cost,
        income: inc.income,
        countdown: inc.countdown,
        unlockIncome: inc.unlockIncome,
    })),
    hardware: HARDWARE_BALANCE.map((hw) => ({
        id: hw.id,
        name: hw.name,
        baseCost: hw.baseCost,
        costMultiplier: hw.costMultiplier,
        speedBonusPerLevel: hw.speedBonusPerLevel,
        maxLevel: hw.maxLevel,
    })),
    hackJobs: HACK_JOBS_BALANCE.map((hack) => ({
        id: hack.id as HackJobId,
        name: hack.name,
        duration: hack.duration,
        cost: hack.cost,
        influenceReward: hack.influenceReward,
        requiredHardware: hack.requiredHardware,
    })),
    levelMultipliers: LEVEL_MULTIPLIERS.map((m) => ({
        qty: m.qty,
        speed: m.speed,
        income: m.income,
    })),
};

/** Deep clone a balance config for modification */
export function cloneConfig(config: BalanceConfig): BalanceConfig {
    return JSON.parse(JSON.stringify(config)) as BalanceConfig;
}

/** Apply percentage adjustment to a numeric field */
export function adjustValue(value: number, percentChange: number): number {
    return value * (1 + percentChange / 100);
}

function applyIncomeAdjustment(
    config: BalanceConfig,
    type: ConfigAdjustment['type'],
    target: string | undefined,
    percent: number,
): void {
    const income = config.incomeTypes.find((i) => i.name === target);
    if (!income) return;
    if (type === 'income_cost') income.cost = adjustValue(income.cost, percent);
    if (type === 'income_reward')
        income.income = adjustValue(income.income, percent);
    if (type === 'income_cooldown')
        income.countdown = adjustValue(income.countdown, percent);
}

function applyHardwareAdjustment(
    config: BalanceConfig,
    type: ConfigAdjustment['type'],
    target: string | undefined,
    percent: number,
): void {
    const hw = config.hardware.find((h) => h.id === target);
    if (!hw) return;
    if (type === 'hardware_cost')
        hw.baseCost = adjustValue(hw.baseCost, percent);
    if (type === 'hardware_multiplier')
        hw.costMultiplier = adjustValue(hw.costMultiplier, percent);
    if (type === 'hardware_speed')
        hw.speedBonusPerLevel = adjustValue(hw.speedBonusPerLevel, percent);
}

function applyHackAdjustment(
    config: BalanceConfig,
    type: ConfigAdjustment['type'],
    target: string | undefined,
    percent: number,
): void {
    const hack = config.hackJobs.find((h) => h.id === target);
    if (!hack) return;
    if (type === 'hack_cost') hack.cost = adjustValue(hack.cost, percent);
    if (type === 'hack_duration')
        hack.duration = adjustValue(hack.duration, percent);
    if (type === 'hack_reward')
        hack.influenceReward = adjustValue(hack.influenceReward, percent);
}

function applyGlobalAdjustment(
    config: BalanceConfig,
    type: ConfigAdjustment['type'],
    percent: number,
): void {
    if (type === 'global_income_scaling') {
        for (const income of config.incomeTypes) {
            income.cost = adjustValue(income.cost, percent);
        }
    }
    if (type === 'global_hardware_scaling') {
        for (const hw of config.hardware) {
            hw.baseCost = adjustValue(hw.baseCost, percent);
        }
    }
    if (type === 'global_hack_scaling') {
        for (const hack of config.hackJobs) {
            hack.cost = adjustValue(hack.cost, percent);
        }
    }
}

/** Apply a single adjustment to the config */
function applySingleAdjustment(
    config: BalanceConfig,
    adj: ConfigAdjustment,
): void {
    const { type, target, percent } = adj;

    if (type.startsWith('income_')) {
        applyIncomeAdjustment(config, type, target, percent);
    } else if (type.startsWith('hardware_')) {
        applyHardwareAdjustment(config, type, target, percent);
    } else if (type.startsWith('hack_')) {
        applyHackAdjustment(config, type, target, percent);
    } else if (type.startsWith('global_')) {
        applyGlobalAdjustment(config, type, percent);
    }
}

/** Create a modified config with specific adjustments */
export function applyConfigAdjustments(
    config: BalanceConfig,
    adjustments: ConfigAdjustment[],
): BalanceConfig {
    const newConfig = cloneConfig(config);

    for (const adj of adjustments) {
        applySingleAdjustment(newConfig, adj);
    }

    newConfig.version += 1;
    return newConfig;
}

/** Configuration adjustment type */
export type ConfigAdjustment = {
    type:
        | 'income_cost'
        | 'income_reward'
        | 'income_cooldown'
        | 'hardware_cost'
        | 'hardware_multiplier'
        | 'hardware_speed'
        | 'hack_cost'
        | 'hack_duration'
        | 'hack_reward'
        | 'global_income_scaling'
        | 'global_hardware_scaling'
        | 'global_hack_scaling';
    target?: string;
    percent: number;
};
