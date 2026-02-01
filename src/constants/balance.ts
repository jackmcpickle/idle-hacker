/**
 * Shared Balance Constants
 *
 * Central configuration for game balance that is used by both
 * the game logic and the AI simulation framework.
 */

import type { HardwareId } from '@/models/HardwareItem';
import type { HackJobId } from '@/models/HackingJob';

/** Income type balance configuration */
export type IncomeBalanceConfig = {
    name: string;
    cost: number;
    income: number;
    countdown: number;
    unlockIncome: number;
};

/** Hardware balance configuration */
export type HardwareBalanceConfig = {
    id: HardwareId;
    name: string;
    description: string;
    baseCost: number;
    costMultiplier: number;
    speedBonusPerLevel: number;
    maxLevel: number;
    unlockHackTier: number;
};

/** Hacking job balance configuration */
export type HackJobBalanceConfig = {
    id: HackJobId;
    name: string;
    description: string;
    duration: number;
    cost: number;
    influenceReward: number;
    requiredHardware: Partial<Record<HardwareId, number>>;
    tier: number;
};

/** Level multiplier tier configuration */
export type LevelMultiplierConfig = {
    qty: number;
    speed: number;
    income: number;
};

// =============================================================================
// INCOME TYPES
// =============================================================================

export const INCOME_BALANCE: IncomeBalanceConfig[] = [
    {
        name: 'Business Cards',
        cost: 10,
        income: 1, // Reduced from 5 - slow start
        countdown: 8000, // Increased from 5s to 8s
        unlockIncome: 0,
    },
    {
        name: 'Freelance Tasks',
        cost: 500, // Reduced cost to unlock earlier
        income: 5, // Much lower income
        countdown: 10000, // 10s cooldown
        unlockIncome: 100, // Lower threshold
    },
    {
        name: 'Resume Updates',
        cost: 5_000,
        income: 25,
        countdown: 15000, // 15s
        unlockIncome: 2_500,
    },
    {
        name: 'Bug Bounties',
        cost: 50_000,
        income: 150,
        countdown: 20000, // 20s
        unlockIncome: 25_000,
    },
    {
        name: 'Basic Website',
        cost: 500_000,
        income: 1_000,
        countdown: 30000, // 30s
        unlockIncome: 250_000,
    },
    {
        name: 'Consulting',
        cost: 5_000_000,
        income: 5_000,
        countdown: 45000, // 45s
        unlockIncome: 2_500_000,
    },
    {
        name: 'E-commerce Site',
        cost: 50_000_000,
        income: 25_000,
        countdown: 60000, // 1min
        unlockIncome: 25_000_000,
    },
    {
        name: 'SaaS Platform',
        cost: 500_000_000,
        income: 100_000,
        countdown: 90000, // 1.5min
        unlockIncome: 250_000_000,
    },
];

// =============================================================================
// HARDWARE
// =============================================================================

export const HARDWARE_BALANCE: HardwareBalanceConfig[] = [
    {
        id: 'cpu',
        name: 'CPU',
        description: 'Faster processing, faster income',
        baseCost: 250, // Affordable early, gates first hack
        costMultiplier: 4, // Steeper scaling
        speedBonusPerLevel: 0.05, // Reduced speed bonus
        maxLevel: 10,
        unlockHackTier: 1,
    },
    {
        id: 'ram',
        name: 'RAM',
        description: 'More memory, more parallel tasks',
        baseCost: 1_000,
        costMultiplier: 4,
        speedBonusPerLevel: 0.04,
        maxLevel: 10,
        unlockHackTier: 1,
    },
    {
        id: 'hdd',
        name: 'Storage',
        description: 'Store more data for bigger jobs',
        baseCost: 10_000,
        costMultiplier: 4,
        speedBonusPerLevel: 0.03,
        maxLevel: 10,
        unlockHackTier: 2,
    },
    {
        id: 'network',
        name: 'Network Card',
        description: 'Faster connection speeds',
        baseCost: 100_000,
        costMultiplier: 4,
        speedBonusPerLevel: 0.04,
        maxLevel: 10,
        unlockHackTier: 2,
    },
    {
        id: 'router',
        name: 'Router',
        description: 'Better routing, harder to trace',
        baseCost: 1_000_000,
        costMultiplier: 4,
        speedBonusPerLevel: 0.04,
        maxLevel: 10,
        unlockHackTier: 3,
    },
];

// =============================================================================
// HACKING JOBS
// =============================================================================

export const HACK_JOBS_BALANCE: HackJobBalanceConfig[] = [
    {
        id: 'wifi-crack',
        name: 'Crack WiFi',
        description: 'Crack neighbor WiFi password',
        duration: 300_000, // 5 minutes
        cost: 50, // Low cost intro hack
        influenceReward: 500, // Significant reward for early game
        requiredHardware: { cpu: 1 },
        tier: 1,
    },
    {
        id: 'email-phish',
        name: 'Phishing Email',
        description: 'Send targeted phishing emails',
        duration: 900_000, // 15 minutes
        cost: 1_000,
        influenceReward: 5_000, // 5x income equivalent
        requiredHardware: { cpu: 2, network: 1 },
        tier: 1,
    },
    {
        id: 'social-scrape',
        name: 'Social Media Scrape',
        description: 'Scrape social media data',
        duration: 1_800_000, // 30 minutes
        cost: 25_000,
        influenceReward: 100_000, // Major payoff
        requiredHardware: { cpu: 3, ram: 2, hdd: 1 },
        tier: 2,
    },
    {
        id: 'ddos-small',
        name: 'Small DDoS',
        description: 'DDoS a small website',
        duration: 3_600_000, // 1 hour
        cost: 500_000,
        influenceReward: 2_500_000, // Huge reward
        requiredHardware: { cpu: 4, network: 3, router: 1 },
        tier: 2,
    },
    {
        id: 'db-breach',
        name: 'Database Breach',
        description: 'Breach a company database',
        duration: 7_200_000, // 2 hours
        cost: 10_000_000,
        influenceReward: 75_000_000,
        requiredHardware: { cpu: 5, ram: 4, hdd: 3, network: 3 },
        tier: 3,
    },
    {
        id: 'ransomware',
        name: 'Ransomware Attack',
        description: 'Deploy ransomware on target',
        duration: 14_400_000, // 4 hours
        cost: 250_000_000,
        influenceReward: 2_000_000_000,
        requiredHardware: { cpu: 7, ram: 5, hdd: 4, network: 4, router: 3 },
        tier: 3,
    },
    {
        id: 'govt-hack',
        name: 'Government Hack',
        description: 'Infiltrate government systems',
        duration: 28_800_000, // 8 hours - requires real commitment
        cost: 5_000_000_000,
        influenceReward: 50_000_000_000, // Massive endgame reward
        requiredHardware: { cpu: 9, ram: 7, hdd: 6, network: 6, router: 5 },
        tier: 4,
    },
];

// =============================================================================
// LEVEL MULTIPLIERS
// =============================================================================

// Reduced multipliers for slower progression - max 2x at endgame
export const LEVEL_MULTIPLIERS: LevelMultiplierConfig[] = [
    { qty: 10000, speed: 2.0, income: 2.0 }, // Max multiplier
    { qty: 5000, speed: 1.8, income: 1.8 },
    { qty: 2500, speed: 1.6, income: 1.6 },
    { qty: 1000, speed: 1.4, income: 1.4 },
    { qty: 500, speed: 1.3, income: 1.3 },
    { qty: 250, speed: 1.2, income: 1.2 },
    { qty: 100, speed: 1.15, income: 1.15 },
    { qty: 50, speed: 1.1, income: 1.1 },
    { qty: 25, speed: 1.05, income: 1.05 },
];

// =============================================================================
// GAME TIMING
// =============================================================================

export const GAME_TICK_INTERVAL_MS = 100;
export const STATE_SYNC_INTERVAL_MS = 60_000;
export const MAX_OFFLINE_EARNINGS_HOURS = 8;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/** Get hardware config by ID */
export function getHardwareConfig(id: HardwareId): HardwareBalanceConfig | undefined {
    return HARDWARE_BALANCE.find((h) => h.id === id);
}

/** Get hack job config by ID */
export function getHackJobConfig(id: string): HackJobBalanceConfig | undefined {
    return HACK_JOBS_BALANCE.find((h) => h.id === id);
}

/** Get income config by name */
export function getIncomeConfig(name: string): IncomeBalanceConfig | undefined {
    return INCOME_BALANCE.find((i) => i.name === name);
}

/** Calculate hardware cost at a given level */
export function calculateHardwareCost(config: HardwareBalanceConfig, level: number): number {
    return Math.floor(config.baseCost * Math.pow(config.costMultiplier, level));
}

/** Get level multiplier for inventory count */
export function getLevelMultiplier(inventory: number): LevelMultiplierConfig | null {
    for (const tier of LEVEL_MULTIPLIERS) {
        if (inventory >= tier.qty) {
            return tier;
        }
    }
    return null;
}
