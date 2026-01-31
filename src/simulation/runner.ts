/**
 * Simulation Runner
 *
 * Runs game simulations and collects results for analysis.
 */

import type {
    SimulationConfig,
    SimulationResult,
    ProgressionSnapshot,
    BottleneckInfo,
    AIStrategy,
} from './types';
import type { BalanceConfig } from './config';
import {
    createInitialState,
    processTick,
    applyAction,
    takeSnapshot,
    canStartHack,
} from './engine';
import type { HardwareId } from '@/models/HardwareItem';
import type { HackJobId } from '@/models/HackingJob';

/** Run a single simulation */
export function runSimulation(
    config: BalanceConfig,
    simConfig: SimulationConfig,
): SimulationResult {
    const startTime = performance.now();
    let state = createInitialState(config);
    const snapshots: ProgressionSnapshot[] = [];
    const tierUnlockTimes: Record<string, number> = {};
    const hardwareMaxTimes: Record<HardwareId, number | null> = {
        cpu: null,
        ram: null,
        hdd: null,
        network: null,
        router: null,
    };
    const hackCompletionTimes: Record<HackJobId, number | null> = {};
    const bottlenecks: BottleneckInfo[] = [];
    let totalTicks = 0;

    // Track for bottleneck detection
    let lastBank = 0;
    let stallTicks = 0;
    const completedHacks = new Set<HackJobId>();

    // Take initial snapshot
    snapshots.push(takeSnapshot(state, config));

    while (state.globalTick < simConfig.maxDurationMs) {
        // Process tick
        state = processTick(state, config, simConfig.tickIntervalMs);
        totalTicks += 1;

        // Apply strategy decision
        const action = simConfig.strategy.decide(state);
        if (action.type !== 'wait') {
            state = applyAction(state, action, config);
        }

        // Track tier unlocks
        for (const income of state.incomeTypes) {
            if (
                income.inventory > 0 &&
                !tierUnlockTimes[income.name] &&
                income.name !== 'Business Cards'
            ) {
                tierUnlockTimes[income.name] = state.globalTick;
            }
        }

        // Track hardware max levels
        for (const hw of state.hardware) {
            if (hw.level === hw.maxLevel && hardwareMaxTimes[hw.id] === null) {
                hardwareMaxTimes[hw.id] = state.globalTick;
            }
        }

        // Track hack completions
        for (const hackConfig of config.hackJobs) {
            if (
                !hackCompletionTimes[hackConfig.id as HackJobId] &&
                canStartHack(state, hackConfig.id as HackJobId, config)
            ) {
                // First time this hack became available
                if (!completedHacks.has(hackConfig.id as HackJobId)) {
                    completedHacks.add(hackConfig.id as HackJobId);
                }
            }
        }

        // Detect bottlenecks
        if (state.bank === lastBank && state.bank < 100) {
            stallTicks += 1;
            if (stallTicks > 100) {
                // 10 seconds of no progress
                bottlenecks.push({
                    timeMs: state.globalTick,
                    type: 'income_stall',
                    description: `Bank stalled at ${state.bank.toFixed(0)} for ${stallTicks * simConfig.tickIntervalMs}ms`,
                    severity: Math.min(10, Math.floor(stallTicks / 100)),
                });
                stallTicks = 0;
            }
        } else {
            stallTicks = 0;
        }
        lastBank = state.bank;

        // Take periodic snapshots
        if (totalTicks % simConfig.snapshotInterval === 0) {
            snapshots.push(takeSnapshot(state, config));
        }
    }

    // Final snapshot
    snapshots.push(takeSnapshot(state, config));

    // Calculate metrics
    const incomeRateOverTime: Array<{ timeMs: number; incomePerSec: number }> = [];
    for (let i = 0; i < snapshots.length; i += Math.max(1, Math.floor(snapshots.length / 20))) {
        incomeRateOverTime.push({
            timeMs: snapshots[i].elapsedMs,
            incomePerSec: snapshots[i].incomePerSecond,
        });
    }

    // Calculate progression score (weighted combination of achievements)
    const progressionScore = calculateProgressionScore(
        state,
        tierUnlockTimes,
        hardwareMaxTimes,
        simConfig.maxDurationMs,
    );

    const realDuration = performance.now() - startTime;

    return {
        config: {
            maxDurationMs: simConfig.maxDurationMs,
            tickIntervalMs: simConfig.tickIntervalMs,
            snapshotInterval: simConfig.snapshotInterval,
            strategyName: simConfig.strategy.name,
            seed: simConfig.seed,
        },
        finalState: state,
        snapshots,
        totalTicks,
        realDurationMs: realDuration,
        metrics: {
            tierUnlockTimes,
            hardwareMaxTimes,
            hackCompletionTimes,
            incomeRateOverTime,
            bottlenecks,
            progressionScore,
        },
    };
}

/** Calculate a progression score for comparing runs */
function calculateProgressionScore(
    state: SimulationState,
    tierUnlockTimes: Record<string, number>,
    hardwareMaxTimes: Record<HardwareId, number | null>,
    maxDuration: number,
): number {
    let score = 0;

    // Points for total earned (log scale)
    score += Math.log10(state.totalEarned + 1) * 10;

    // Points for influence (log scale)
    score += Math.log10(state.influence + 1) * 5;

    // Points for unlocking tiers early (relative to max duration)
    for (const [_tier, time] of Object.entries(tierUnlockTimes)) {
        const earlyBonus = 1 - time / maxDuration;
        score += earlyBonus * 20;
    }

    // Points for maxing hardware
    for (const hw of state.hardware) {
        score += hw.level * 2;
        if (hw.level === hw.maxLevel) {
            score += 10;
        }
    }

    // Points for total inventory
    const totalInventory = state.incomeTypes.reduce((s, t) => s + t.inventory, 0);
    score += Math.log10(totalInventory + 1) * 5;

    // Points for hacks completed
    score += state.totalHacksCompleted * 2;

    return Math.round(score * 100) / 100;
}

/** Batch result for multiple simulations */
export type BatchResult = {
    config: BalanceConfig;
    strategies: string[];
    runCount: number;
    durationMs: number;
    results: Map<string, SimulationResult[]>;
    summary: BatchSummary;
};

/** Summary statistics for batch results */
export type BatchSummary = {
    byStrategy: Record<
        string,
        {
            avgProgressionScore: number;
            avgTotalEarned: number;
            avgInfluence: number;
            avgHacksCompleted: number;
            tierUnlockPercentages: Record<string, number>;
            avgBottleneckCount: number;
        }
    >;
    overallAvgScore: number;
    bestStrategy: string;
    worstStrategy: string;
    recommendations: string[];
};

/** Run multiple simulations with different strategies */
export function runBatchSimulation(
    config: BalanceConfig,
    strategies: AIStrategy[],
    runCount: number,
    durationMs: number,
    tickIntervalMs = 100,
    snapshotInterval = 100,
): BatchResult {
    const results = new Map<string, SimulationResult[]>();

    for (const strategy of strategies) {
        const stratResults: SimulationResult[] = [];
        for (let i = 0; i < runCount; i += 1) {
            const result = runSimulation(config, {
                maxDurationMs: durationMs,
                tickIntervalMs,
                snapshotInterval,
                strategy,
                seed: 12345 + i, // Different seed each run
            });
            stratResults.push(result);
        }
        results.set(strategy.name, stratResults);
    }

    const summary = calculateBatchSummary(results, config);

    return {
        config,
        strategies: strategies.map((s) => s.name),
        runCount,
        durationMs,
        results,
        summary,
    };
}

/** Calculate summary statistics for batch results */
function calculateBatchSummary(
    results: Map<string, SimulationResult[]>,
    config: BalanceConfig,
): BatchSummary {
    const byStrategy: BatchSummary['byStrategy'] = {};
    let bestStrategy = '';
    let worstStrategy = '';
    let bestScore = -Infinity;
    let worstScore = Infinity;
    let totalScore = 0;
    let totalRuns = 0;

    for (const [strategyName, runs] of results.entries()) {
        const scores = runs.map((r) => r.metrics.progressionScore);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const avgEarned = runs.reduce((a, r) => a + r.finalState.totalEarned, 0) / runs.length;
        const avgInfluence = runs.reduce((a, r) => a + r.finalState.influence, 0) / runs.length;
        const avgHacks = runs.reduce((a, r) => a + r.finalState.totalHacksCompleted, 0) / runs.length;
        const avgBottlenecks = runs.reduce((a, r) => a + r.metrics.bottlenecks.length, 0) / runs.length;

        // Calculate tier unlock percentages
        const tierUnlockPercentages: Record<string, number> = {};
        for (const income of config.incomeTypes) {
            if (income.name === 'Business Cards') continue;
            const unlockedCount = runs.filter(
                (r) => r.metrics.tierUnlockTimes[income.name] !== undefined,
            ).length;
            tierUnlockPercentages[income.name] = (unlockedCount / runs.length) * 100;
        }

        byStrategy[strategyName] = {
            avgProgressionScore: avgScore,
            avgTotalEarned: avgEarned,
            avgInfluence: avgInfluence,
            avgHacksCompleted: avgHacks,
            tierUnlockPercentages,
            avgBottleneckCount: avgBottlenecks,
        };

        totalScore += avgScore * runs.length;
        totalRuns += runs.length;

        if (avgScore > bestScore) {
            bestScore = avgScore;
            bestStrategy = strategyName;
        }
        if (avgScore < worstScore) {
            worstScore = avgScore;
            worstStrategy = strategyName;
        }
    }

    const recommendations = generateRecommendations(byStrategy, config);

    return {
        byStrategy,
        overallAvgScore: totalScore / totalRuns,
        bestStrategy,
        worstStrategy,
        recommendations,
    };
}

/** Generate balance recommendations based on results */
function generateRecommendations(
    byStrategy: BatchSummary['byStrategy'],
    _config: BalanceConfig,
): string[] {
    const recommendations: string[] = [];

    // Check for tier unlock issues
    for (const [stratName, stats] of Object.entries(byStrategy)) {
        for (const [tierName, percentage] of Object.entries(stats.tierUnlockPercentages)) {
            if (percentage < 50) {
                recommendations.push(
                    `${tierName} only unlocked in ${percentage.toFixed(0)}% of ${stratName} runs - consider lowering unlock threshold or cost`,
                );
            }
        }
    }

    // Check for bottleneck issues
    for (const [stratName, stats] of Object.entries(byStrategy)) {
        if (stats.avgBottleneckCount > 5) {
            recommendations.push(
                `${stratName} strategy encountered ${stats.avgBottleneckCount.toFixed(1)} avg bottlenecks - progression may be too slow`,
            );
        }
    }

    // Check strategy balance
    const scores = Object.values(byStrategy).map((s) => s.avgProgressionScore);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    if (maxScore > minScore * 2) {
        recommendations.push(
            'Large variance between strategies suggests some paths are significantly stronger',
        );
    }

    // Check hack completion rates
    const avgHacks = Object.values(byStrategy).reduce(
        (a, s) => a + s.avgHacksCompleted,
        0,
    ) / Object.keys(byStrategy).length;
    if (avgHacks < 1) {
        recommendations.push(
            'Very few hacks completed on average - hardware requirements may be too steep',
        );
    }

    return recommendations;
}
