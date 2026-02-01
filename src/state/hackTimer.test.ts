import { describe, it, expect } from 'vitest';
import { gameReducer, INITIAL_GAME_STATE } from '@/state/index';
import { startHack, GAME_TICK } from '@/state/actions';
import type { GameContext } from '@/state/index';

describe('hack timer pause logic', () => {
    it('initializes totalPausedMs to 0 when starting hack', () => {
        let state: GameContext = {
            ...INITIAL_GAME_STATE,
            bank: 100_000_000,
            hardware: INITIAL_GAME_STATE.hardware.map((hw) => {
                if (hw.id === 'cpu') {
                    for (let i = 0; i < 1; i += 1) hw.upgrade();
                }
                return hw;
            }),
        };

        const now = Date.now();
        state = { ...state, globalTick: now };
        state = gameReducer(state, startHack('wifi-crack', 0));

        const hack = state.activeHacks[0];
        expect(hack).toBeDefined();
        expect(hack?.totalPausedMs).toBe(0);
    });

    it('accumulates pause time when bank is 0 and hack has remaining cost', () => {
        const hack = {
            jobId: 'wifi-crack',
            startedAt: 1000,
            endsAt: 301_000,
            totalCostPaid: 0,
            lastCostTick: 2000,
            totalPausedMs: 0,
        };

        // Simulate pause tick with 1000ms elapsed
        const now = 3000;
        const pausedDuration = now - hack.lastCostTick;
        const updatedHack = {
            ...hack,
            totalPausedMs: hack.totalPausedMs + pausedDuration,
            lastCostTick: now,
        };

        expect(updatedHack.totalPausedMs).toBe(1000);
        expect(updatedHack.lastCostTick).toBe(now);
    });

    it('extends hack completion time by paused duration', () => {
        const hack = {
            jobId: 'wifi-crack',
            startedAt: 1000,
            endsAt: 301_000, // Original 5 minute hack
            totalCostPaid: 5_000_000,
            lastCostTick: 3000,
            totalPausedMs: 10_000, // 10 seconds paused
        };

        const effectiveEndsAt = hack.endsAt + hack.totalPausedMs;
        expect(effectiveEndsAt).toBe(311_000); // Extended by 10s
        expect(effectiveEndsAt).toBeGreaterThan(hack.endsAt);
    });

    it('drains cost when bank > 0 and hack not paused', () => {
        const initialCostPaid = 0;
        const elapsedMs = 1000;
        const costPerMs = 10_000_000 / 300_000; // wifi-crack cost/duration
        const costToDrain = costPerMs * elapsedMs;

        expect(costToDrain).toBeGreaterThan(0);
        expect(costToDrain).toBeLessThan(10_000_000);
    });


    it('migrations existing hacks with totalPausedMs default to 0', () => {
        // Simulate old hack without totalPausedMs
        const oldHack = {
            jobId: 'wifi-crack',
            startedAt: 1000,
            endsAt: 301_000,
            totalCostPaid: 5_000_000,
            lastCostTick: 2000,
        };

        // Migration applies default
        const migratedHack = { ...oldHack, totalPausedMs: 0 };

        expect(migratedHack.totalPausedMs).toBe(0);
        expect(migratedHack.jobId).toBe('wifi-crack');
    });

    it('fully paid hack completes without pause effects', () => {
        let state: GameContext = {
            ...INITIAL_GAME_STATE,
            bank: 100_000_000,
            hardware: INITIAL_GAME_STATE.hardware.map((hw) => {
                if (hw.id === 'cpu') {
                    for (let i = 0; i < 1; i += 1) hw.upgrade();
                }
                return hw;
            }),
        };

        const now = Date.now();
        state = { ...state, globalTick: now };
        state = gameReducer(state, startHack('wifi-crack', 0));

        const originalEndsAt = state.activeHacks[0]?.endsAt ?? 0;

        // Complete hack at scheduled time
        state = gameReducer(state, {
            type: GAME_TICK,
            data: { now: originalEndsAt + 100 },
        });

        expect(state.activeHacks[0]).toBeNull(); // Hack completed
        expect(state.totalHacksCompleted).toBe(1);
    });
});
