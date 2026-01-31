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
        income: 5,
        countdown: 5000,
        unlockIncome: 0,
    },
    {
        name: 'Freelance Tasks',
        cost: 1_000,
        income: 500,
        countdown: 6000,
        unlockIncome: 1_000,
    },
    {
        name: 'Resume Updates',
        cost: 100_000,
        income: 50_000,
        countdown: 8000,
        unlockIncome: 100_000,
    },
    {
        name: 'Bug Bounties',
        cost: 10_000_000,
        income: 5_000_000,
        countdown: 15000,
        unlockIncome: 10_000_000,
    },
    {
        name: 'Basic Website',
        cost: 1_000_000_000,
        income: 500_000_000,
        countdown: 30000,
        unlockIncome: 1_000_000_000,
    },
    {
        name: 'Consulting',
        cost: 100_000_000_000,
        income: 50_000_000_000,
        countdown: 45000,
        unlockIncome: 100_000_000_000,
    },
    {
        name: 'E-commerce Site',
        cost: 10_000_000_000_000,
        income: 5_000_000_000_000,
        countdown: 60000,
        unlockIncome: 10_000_000_000_000,
    },
    {
        name: 'SaaS Platform',
        cost: 1_000_000_000_000_000,
        income: 500_000_000_000_000,
        countdown: 90000,
        unlockIncome: 1_000_000_000_000_000,
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
        baseCost: 1_000,
        costMultiplier: 3,
        speedBonusPerLevel: 0.1,
        maxLevel: 10,
        unlockHackTier: 1,
    },
    {
        id: 'ram',
        name: 'RAM',
        description: 'More memory, more parallel tasks',
        baseCost: 10_000,
        costMultiplier: 3,
        speedBonusPerLevel: 0.08,
        maxLevel: 10,
        unlockHackTier: 1,
    },
    {
        id: 'hdd',
        name: 'Storage',
        description: 'Store more data for bigger jobs',
        baseCost: 100_000,
        costMultiplier: 3,
        speedBonusPerLevel: 0.06,
        maxLevel: 10,
        unlockHackTier: 2,
    },
    {
        id: 'network',
        name: 'Network Card',
        description: 'Faster connection speeds',
        baseCost: 1_000_000,
        costMultiplier: 3,
        speedBonusPerLevel: 0.08,
        maxLevel: 10,
        unlockHackTier: 2,
    },
    {
        id: 'router',
        name: 'Router',
        description: 'Better routing, harder to trace',
        baseCost: 10_000_000,
        costMultiplier: 3,
        speedBonusPerLevel: 0.08,
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
        duration: 60_000,
        cost: 100,
        influenceReward: 10,
        requiredHardware: { cpu: 1 },
        tier: 1,
    },
    {
        id: 'email-phish',
        name: 'Phishing Email',
        description: 'Send targeted phishing emails',
        duration: 120_000,
        cost: 10_000,
        influenceReward: 1_000,
        requiredHardware: { cpu: 2, network: 1 },
        tier: 1,
    },
    {
        id: 'social-scrape',
        name: 'Social Media Scrape',
        description: 'Scrape social media data',
        duration: 180_000,
        cost: 1_000_000,
        influenceReward: 100_000,
        requiredHardware: { cpu: 2, ram: 2, hdd: 1 },
        tier: 2,
    },
    {
        id: 'ddos-small',
        name: 'Small DDoS',
        description: 'DDoS a small website',
        duration: 300_000,
        cost: 100_000_000,
        influenceReward: 10_000_000,
        requiredHardware: { cpu: 3, network: 2, router: 1 },
        tier: 2,
    },
    {
        id: 'db-breach',
        name: 'Database Breach',
        description: 'Breach a company database',
        duration: 600_000,
        cost: 10_000_000_000,
        influenceReward: 1_000_000_000,
        requiredHardware: { cpu: 4, ram: 3, hdd: 2, network: 2 },
        tier: 3,
    },
    {
        id: 'ransomware',
        name: 'Ransomware Attack',
        description: 'Deploy ransomware on target',
        duration: 900_000,
        cost: 1_000_000_000_000,
        influenceReward: 100_000_000_000,
        requiredHardware: { cpu: 5, ram: 4, hdd: 3, network: 3, router: 2 },
        tier: 3,
    },
    {
        id: 'govt-hack',
        name: 'Government Hack',
        description: 'Infiltrate government systems',
        duration: 1_800_000,
        cost: 100_000_000_000_000,
        influenceReward: 10_000_000_000_000,
        requiredHardware: { cpu: 7, ram: 6, hdd: 5, network: 5, router: 4 },
        tier: 4,
    },
];

// =============================================================================
// LEVEL MULTIPLIERS
// =============================================================================

export const LEVEL_MULTIPLIERS: LevelMultiplierConfig[] = [
    { qty: 1000000000, speed: 10, income: 10 },
    { qty: 500000000, speed: 9.5, income: 9.5 },
    { qty: 100000000, speed: 9, income: 9 },
    { qty: 50000000, speed: 8.5, income: 8.5 },
    { qty: 10000000, speed: 8, income: 8 },
    { qty: 5000000, speed: 7.5, income: 7.5 },
    { qty: 1000000, speed: 7, income: 7 },
    { qty: 500000, speed: 6.5, income: 6.5 },
    { qty: 100000, speed: 6, income: 6 },
    { qty: 50000, speed: 5.5, income: 5.5 },
    { qty: 10000, speed: 5, income: 5 },
    { qty: 5000, speed: 4.5, income: 4.5 },
    { qty: 1000, speed: 4, income: 4 },
    { qty: 500, speed: 3, income: 3 },
    { qty: 250, speed: 2.5, income: 2.5 },
    { qty: 100, speed: 2, income: 2 },
    { qty: 50, speed: 1.5, income: 1.5 },
    { qty: 25, speed: 1.25, income: 1.25 },
    { qty: 10, speed: 1.1, income: 1.1 },
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
