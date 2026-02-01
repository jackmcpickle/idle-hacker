import { INITIAL_GAME_STATE, type GameContext } from '.';
import { HardwareItem } from '@/models/HardwareItem';
import { IncomeType } from '@/models/IncomeType';

// Helper to create a fresh state for testing (using new balanced values)
export function createFreshState(): GameContext {
    return {
        ...INITIAL_GAME_STATE,
        incomeTypes: [
            new IncomeType({
                name: 'Business Cards',
                cost: 10,
                income: 1,
                countdown: 8000,
                inventory: 1,
                unlockIncome: 0,
            }),
            new IncomeType({
                name: 'Freelance Tasks',
                cost: 500,
                income: 5,
                countdown: 10000,
                unlockIncome: 100,
            }),
            new IncomeType({
                name: 'Resume Updates',
                cost: 5_000,
                income: 25,
                countdown: 15000,
                unlockIncome: 2_500,
            }),
            new IncomeType({
                name: 'Bug Bounties',
                cost: 50_000,
                income: 150,
                countdown: 20000,
                unlockIncome: 25_000,
            }),
            new IncomeType({
                name: 'Basic Website',
                cost: 500_000,
                income: 1_000,
                countdown: 30000,
                unlockIncome: 250_000,
            }),
            new IncomeType({
                name: 'Consulting',
                cost: 5_000_000,
                income: 5_000,
                countdown: 45000,
                unlockIncome: 2_500_000,
            }),
            new IncomeType({
                name: 'E-commerce Site',
                cost: 50_000_000,
                income: 25_000,
                countdown: 60000,
                unlockIncome: 25_000_000,
            }),
            new IncomeType({
                name: 'SaaS Platform',
                cost: 500_000_000,
                income: 100_000,
                countdown: 90000,
                unlockIncome: 250_000_000,
            }),
        ],
        hardware: HardwareItem.createAll(),
        activeHacks: [null],
        maxHackSlots: 1,
        lastSyncedAt: Date.now(),
        incomeTimers: {},
        globalTick: Date.now(),
        completedHacks: [],
    };
}
