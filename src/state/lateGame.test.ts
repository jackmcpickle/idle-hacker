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

        // Add lots of inventory to hit high multipliers (new scaling: max 2x at 10000)
        state.incomeTypes[0].addInventory(999); // 1000 Business Cards (1.4x multiplier)
        state.incomeTypes[1].addInventory(500); // 500 Freelance (1.3x)
        state.incomeTypes[2].addInventory(100); // 100 Resume Updates (1.15x)
        state.incomeTypes[3].addInventory(50); // 50 Bug Bounties (1.1x)
        state.incomeTypes[4].addInventory(25); // 25 Basic Websites (1.05x)

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

        // 1000 inventory = 1.4x multiplier (new reduced scaling)
        expect(businessCards?.incomeMultiplier).toBe(1.4);
        // 500 inventory = 1.3x multiplier
        expect(freelance?.incomeMultiplier).toBe(1.3);
    });

    it('has maximum hardware speed bonus', () => {
        const totalSpeedBonus = state.hardware.reduce(
            (sum, hw) => sum + hw.getSpeedBonus(),
            0,
        );

        // CPU: 0.05*10 + RAM: 0.04*10 + HDD: 0.03*10 + Network: 0.04*10 + Router: 0.04*10
        // = 0.5 + 0.4 + 0.3 + 0.4 + 0.4 = 2.0
        expect(totalSpeedBonus).toBe(2.0);
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

        // With 3x speed multiplier (1 + 2.0 hardware bonus),
        // 8000ms countdown becomes ~2667ms
        const threeSecondsLater = now + 3000;
        const newState = gameReducer(state, {
            type: GAME_TICK,
            data: { now: threeSecondsLater },
        });

        // Business Cards: 1000 * 1 * 1.4 = 1400 income
        expect(newState.bank).toBeGreaterThan(state.bank);
    });

    it('hack completes and awards influence', () => {
        const startTime = Date.now();
        state.activeHacks[0] = {
            jobId: 'wifi-crack',
            startedAt: startTime,
            endsAt: startTime + 300000, // 5 minute hack
            totalCostPaid: 50, // Fully paid
            lastCostTick: startTime,
        };

        const initialInfluence = state.influence;

        // Tick after hack completes
        const afterComplete = startTime + 301000;
        const newState = gameReducer(state, {
            type: GAME_TICK,
            data: { now: afterComplete },
        });

        expect(newState.influence).toBe(initialInfluence + 500); // wifi-crack = 500 influence
        expect(newState.totalHacksCompleted).toBe(51);
        expect(newState.activeHacks[0]).toBeNull();
        expect(newState.completedHacks).toHaveLength(1);
        expect(newState.completedHacks[0].jobName).toBe('Crack WiFi');
    });

    it('calculates massive income with high multipliers', () => {
        const businessCards = state.incomeTypes.find(
            (i) => i.name === 'Business Cards',
        );

        // 1000 inventory * 1 base income * 1.4x multiplier = 1400 per cycle
        const incomePerCycle = businessCards?.getIncome().real();
        expect(incomePerCycle).toBe(1400);
    });

    it('resets game to initial state', () => {
        const newState = gameReducer(state, { type: RESET_GAME });

        expect(newState.bank).toBe(0);
        expect(newState.influence).toBe(0);
        expect(newState.totalEarned).toBe(0);
        expect(newState.maxHackSlots).toBe(1);
    });
});
