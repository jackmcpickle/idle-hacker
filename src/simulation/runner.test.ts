import { describe, it, expect } from 'vitest';
import { runSimulation, runBatchSimulation } from './runner';
import { DEFAULT_BALANCE_CONFIG } from './config';
import { createGreedyStrategy, createBalancedStrategy } from './strategies';

describe('Simulation Runner', () => {
    describe('runSimulation', () => {
        it('completes simulation and returns result', () => {
            const result = runSimulation(DEFAULT_BALANCE_CONFIG, {
                maxDurationMs: 60000, // 1 minute
                tickIntervalMs: 100,
                snapshotInterval: 100,
                strategy: createGreedyStrategy(DEFAULT_BALANCE_CONFIG),
            });

            expect(result.totalTicks).toBeGreaterThan(0);
            expect(result.snapshots.length).toBeGreaterThan(0);
            expect(result.finalState.totalEarned).toBeGreaterThan(0);
            expect(result.metrics.progressionScore).toBeGreaterThan(0);
        });

        it('tracks income tier unlocks', () => {
            const result = runSimulation(DEFAULT_BALANCE_CONFIG, {
                maxDurationMs: 300000, // 5 minutes
                tickIntervalMs: 100,
                snapshotInterval: 100,
                strategy: createGreedyStrategy(DEFAULT_BALANCE_CONFIG),
            });

            // Should have unlocked at least Freelance Tasks (1K threshold)
            const earned = result.finalState.totalEarned;
            if (earned >= 1000) {
                expect(result.metrics.tierUnlockTimes['Freelance Tasks']).toBeDefined();
            }
        });

        it('collects periodic snapshots', () => {
            const result = runSimulation(DEFAULT_BALANCE_CONFIG, {
                maxDurationMs: 60000,
                tickIntervalMs: 100,
                snapshotInterval: 50, // Every 50 ticks
                strategy: createGreedyStrategy(DEFAULT_BALANCE_CONFIG),
            });

            // Should have multiple snapshots
            expect(result.snapshots.length).toBeGreaterThan(5);

            // Snapshots should be chronologically ordered
            for (let i = 1; i < result.snapshots.length; i += 1) {
                expect(result.snapshots[i].elapsedMs).toBeGreaterThanOrEqual(
                    result.snapshots[i - 1].elapsedMs,
                );
            }
        });

        it('respects maxDurationMs', () => {
            const maxDuration = 30000;
            const result = runSimulation(DEFAULT_BALANCE_CONFIG, {
                maxDurationMs: maxDuration,
                tickIntervalMs: 100,
                snapshotInterval: 100,
                strategy: createGreedyStrategy(DEFAULT_BALANCE_CONFIG),
            });

            expect(result.finalState.globalTick).toBeLessThanOrEqual(
                maxDuration + 100,
            );
        });
    });

    describe('runBatchSimulation', () => {
        it('runs multiple strategies', () => {
            const strategies = [
                createGreedyStrategy(DEFAULT_BALANCE_CONFIG),
                createBalancedStrategy(DEFAULT_BALANCE_CONFIG),
            ];

            const result = runBatchSimulation(
                DEFAULT_BALANCE_CONFIG,
                strategies,
                2, // 2 runs per strategy
                30000, // 30 seconds
                100,
                100,
            );

            expect(result.strategies.length).toBe(2);
            expect(result.results.get('Greedy')?.length).toBe(2);
            expect(result.results.get('Balanced')?.length).toBe(2);
        });

        it('calculates summary statistics', () => {
            const strategies = [createGreedyStrategy(DEFAULT_BALANCE_CONFIG)];

            const result = runBatchSimulation(
                DEFAULT_BALANCE_CONFIG,
                strategies,
                3,
                30000,
                100,
                100,
            );

            expect(result.summary.byStrategy['Greedy']).toBeDefined();
            expect(result.summary.byStrategy['Greedy'].avgProgressionScore).toBeGreaterThan(0);
            expect(result.summary.overallAvgScore).toBeGreaterThan(0);
            expect(result.summary.bestStrategy).toBe('Greedy');
        });

        it('identifies best and worst strategies', () => {
            const strategies = [
                createGreedyStrategy(DEFAULT_BALANCE_CONFIG),
                createBalancedStrategy(DEFAULT_BALANCE_CONFIG),
            ];

            const result = runBatchSimulation(
                DEFAULT_BALANCE_CONFIG,
                strategies,
                2,
                60000,
                100,
                100,
            );

            expect(result.summary.bestStrategy).toBeDefined();
            expect(result.summary.worstStrategy).toBeDefined();
        });
    });

    describe('progression scoring', () => {
        it('rewards higher earnings', () => {
            const shortResult = runSimulation(DEFAULT_BALANCE_CONFIG, {
                maxDurationMs: 30000,
                tickIntervalMs: 100,
                snapshotInterval: 100,
                strategy: createGreedyStrategy(DEFAULT_BALANCE_CONFIG),
            });

            const longResult = runSimulation(DEFAULT_BALANCE_CONFIG, {
                maxDurationMs: 120000,
                tickIntervalMs: 100,
                snapshotInterval: 100,
                strategy: createGreedyStrategy(DEFAULT_BALANCE_CONFIG),
            });

            // Longer run should have higher score due to more progress
            expect(longResult.metrics.progressionScore).toBeGreaterThan(
                shortResult.metrics.progressionScore,
            );
        });
    });
});
