import { describe, it, expect, beforeEach } from 'vitest';
import { gameReducer, type GameContext } from '.';
import { START_HACK, GAME_TICK, RESET_GAME } from './actions';
import { createFreshState } from './testHelpers';

describe('Late Game State', () => {
    let state: GameContext;

    beforeEach(() => {
        state = createFreshState();
        // Set up late-game state: high earnings, maxed hardware, multiple income sources
        state.bank = 500000;
        state.totalEarned = 2000000;
        state.influence = 1000;
        state.totalHacksCompleted = 50;

        // Add lots of inventory to hit high multipliers
        state.incomeTypes[0].addInventory(999); // 1000 Business Cards (4x multiplier)
        state.incomeTypes[1].addInventory(500); // 500 Freelance (3x)
        state.incomeTypes[2].addInventory(100); // 100 Resume Updates (2x)
        state.incomeTypes[3].addInventory(50); // 50 Bug Bounties (1.5x)
        state.incomeTypes[4].addInventory(10); // 10 Basic Websites (1.1x)

        // Max out hardware
        for (const hw of state.hardware) {
            while (hw.level < 10) {
                hw.upgrade();
            }
        }

        // Recalculate max hack slots
        state.maxHackSlots = 4; // RAM level 10 = 1 + floor(10/3) = 4 slots
        state.activeHacks = [null, null, null, null];
    });

    it('has high level multipliers on income sources', () => {
        const businessCards = state.incomeTypes.find(
            (i) => i.name === 'Business Cards',
        );
        const freelance = state.incomeTypes.find(
            (i) => i.name === 'Freelance Tasks',
        );

        // 1000 inventory = 4x multiplier
        expect(businessCards?.incomeMultiplier).toBe(4);
        // 500 inventory = 3x multiplier
        expect(freelance?.incomeMultiplier).toBe(3);
    });

    it('has maximum hardware speed bonus', () => {
        const totalSpeedBonus = state.hardware.reduce(
            (sum, hw) => sum + hw.getSpeedBonus(),
            0,
        );

        // CPU: 0.1*10 + RAM: 0.08*10 + HDD: 0.06*10 + Network: 0.08*10 + Router: 0.08*10
        // = 1.0 + 0.8 + 0.6 + 0.8 + 0.8 = 4.0
        expect(totalSpeedBonus).toBe(4.0);
    });

    it('has 4 hack slots available', () => {
        expect(state.maxHackSlots).toBe(4);
        expect(state.activeHacks).toHaveLength(4);
    });

    it('can run high-tier hacks', () => {
        // govt-hack requires: cpu: 7, ram: 6, hdd: 5, network: 5, router: 4
        state = gameReducer(state, {
            type: START_HACK,
            data: { jobId: 'govt-hack', slot: 0 },
        });

        expect(state.activeHacks[0]?.jobId).toBe('govt-hack');
    });

    it('can run 4 hacks simultaneously', () => {
        state = gameReducer(state, {
            type: START_HACK,
            data: { jobId: 'wifi-crack', slot: 0 },
        });
        state = gameReducer(state, {
            type: START_HACK,
            data: { jobId: 'email-phish', slot: 1 },
        });
        state = gameReducer(state, {
            type: START_HACK,
            data: { jobId: 'social-scrape', slot: 2 },
        });
        state = gameReducer(state, {
            type: START_HACK,
            data: { jobId: 'db-breach', slot: 3 },
        });

        expect(state.activeHacks.every((h) => h !== null)).toBe(true);
    });

    it('game tick collects income very fast with max hardware', () => {
        const now = Date.now();
        state.incomeTimers = {};

        // Initialize timer
        state = gameReducer(state, { type: GAME_TICK, data: { now } });

        // With 5x speed multiplier (1 + 4.0 hardware bonus),
        // 5000ms countdown becomes 1000ms
        const oneSecondLater = now + 1000;
        const newState = gameReducer(state, {
            type: GAME_TICK,
            data: { now: oneSecondLater },
        });

        // Business Cards: 1000 * 5 * 4 = 20000 income
        expect(newState.bank).toBeGreaterThan(state.bank);
    });

    it('hack completes and awards influence', () => {
        const startTime = Date.now();
        state.activeHacks[0] = {
            jobId: 'wifi-crack',
            startedAt: startTime,
            endsAt: startTime + 60000, // 60 second hack
            totalCostPaid: 250, // Fully paid
            lastCostTick: startTime,
        };

        const initialInfluence = state.influence;

        // Tick after hack completes
        const afterComplete = startTime + 61000;
        const newState = gameReducer(state, {
            type: GAME_TICK,
            data: { now: afterComplete },
        });

        expect(newState.influence).toBe(initialInfluence + 15); // wifi-crack = 15 influence
        expect(newState.totalHacksCompleted).toBe(51);
        expect(newState.activeHacks[0]).toBeNull();
        expect(newState.completedHacks).toHaveLength(1);
        expect(newState.completedHacks[0].jobName).toBe('Crack WiFi');
    });

    it('calculates massive income with high multipliers', () => {
        const businessCards = state.incomeTypes.find(
            (i) => i.name === 'Business Cards',
        );

        // 1000 inventory * 5 base income * 4x multiplier = 20,000 per cycle
        const incomePerCycle = businessCards?.getIncome().real();
        expect(incomePerCycle).toBe(20000);
    });

    it('resets game to initial state', () => {
        const newState = gameReducer(state, { type: RESET_GAME });

        expect(newState.bank).toBe(0);
        expect(newState.influence).toBe(0);
        expect(newState.totalEarned).toBe(0);
        expect(newState.maxHackSlots).toBe(1);
    });
});
