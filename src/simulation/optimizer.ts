/**
 * Iterative Balance Optimizer
 *
 * Runs multiple iterations of simulation batches, collecting results
 * for AI analysis and applying suggested adjustments.
 */

import type { BalanceConfig, ConfigAdjustment } from './config';
import { DEFAULT_BALANCE_CONFIG, applyConfigAdjustments, cloneConfig } from './config';
import type { BatchResult, BatchSummary } from './runner';
import { runBatchSimulation } from './runner';
import { getAllStrategies } from './strategies';
import {
    generateAIReport,
    generateIterationComparison,
    generateFinalReport,
    parseAdjustments,
} from './report';

/** Optimization session state */
export type OptimizationSession = {
    maxIterations: number;
    currentIteration: number;
    simulationDurationMs: number;
    runsPerStrategy: number;
    tickIntervalMs: number;
    currentConfig: BalanceConfig;
    iterationHistory: IterationResult[];
    status: 'ready' | 'running' | 'waiting_for_adjustments' | 'completed';
    lastReport: string;
};

/** Result of a single iteration */
export type IterationResult = {
    iteration: number;
    config: BalanceConfig;
    batchResult: BatchResult;
    summary: BatchSummary;
    adjustments: ConfigAdjustment[];
    report: string;
};

/** Create a new optimization session */
export function createOptimizationSession(options?: {
    maxIterations?: number;
    simulationDurationMs?: number;
    runsPerStrategy?: number;
    tickIntervalMs?: number;
    initialConfig?: BalanceConfig;
}): OptimizationSession {
    return {
        maxIterations: options?.maxIterations ?? 10,
        currentIteration: 0,
        simulationDurationMs: options?.simulationDurationMs ?? 1800000, // 30 minutes
        runsPerStrategy: options?.runsPerStrategy ?? 20,
        tickIntervalMs: options?.tickIntervalMs ?? 100,
        currentConfig: options?.initialConfig ?? cloneConfig(DEFAULT_BALANCE_CONFIG),
        iterationHistory: [],
        status: 'ready',
        lastReport: '',
    };
}

/** Run a single optimization iteration */
export function runIteration(session: OptimizationSession): OptimizationSession {
    if (session.currentIteration >= session.maxIterations) {
        return { ...session, status: 'completed' };
    }

    const strategies = getAllStrategies(session.currentConfig);

    console.log(`Running iteration ${session.currentIteration + 1}/${session.maxIterations}...`);
    console.log(`  - Strategies: ${strategies.length}`);
    console.log(`  - Runs per strategy: ${session.runsPerStrategy}`);
    console.log(`  - Simulation duration: ${session.simulationDurationMs / 1000}s`);

    const batchResult = runBatchSimulation(
        session.currentConfig,
        strategies,
        session.runsPerStrategy,
        session.simulationDurationMs,
        session.tickIntervalMs,
        100, // snapshot interval
    );

    const report = generateAIReport(batchResult, session.currentIteration + 1);

    const iterationResult: IterationResult = {
        iteration: session.currentIteration + 1,
        config: cloneConfig(session.currentConfig),
        batchResult,
        summary: batchResult.summary,
        adjustments: [],
        report,
    };

    return {
        ...session,
        currentIteration: session.currentIteration + 1,
        iterationHistory: [...session.iterationHistory, iterationResult],
        status: 'waiting_for_adjustments',
        lastReport: report,
    };
}

/** Apply adjustments and prepare for next iteration */
export function applyAdjustmentsToSession(
    session: OptimizationSession,
    adjustmentsJson: string,
): OptimizationSession {
    if (session.status !== 'waiting_for_adjustments') {
        console.warn('Session is not waiting for adjustments');
        return session;
    }

    const adjustments = parseAdjustments(adjustmentsJson);

    if (adjustments.length === 0) {
        console.log('No valid adjustments found, keeping current config');
    } else {
        console.log(`Applying ${adjustments.length} adjustments...`);
        for (const adj of adjustments) {
            const target = adj.target ? ` on ${adj.target}` : '';
            console.log(`  - ${adj.type}${target}: ${adj.percent >= 0 ? '+' : ''}${adj.percent}%`);
        }
    }

    // Update the last iteration with the adjustments
    const updatedHistory = [...session.iterationHistory];
    if (updatedHistory.length > 0) {
        updatedHistory[updatedHistory.length - 1] = {
            ...updatedHistory[updatedHistory.length - 1],
            adjustments,
        };
    }

    const newConfig = applyConfigAdjustments(session.currentConfig, adjustments);

    const isComplete = session.currentIteration >= session.maxIterations;

    return {
        ...session,
        currentConfig: newConfig,
        iterationHistory: updatedHistory,
        status: isComplete ? 'completed' : 'ready',
    };
}

/** Get comparison report across iterations */
export function getIterationComparison(session: OptimizationSession): string {
    const iterations = session.iterationHistory.map((iter) => ({
        iteration: iter.iteration,
        summary: iter.summary,
        configVersion: iter.config.version,
    }));

    return generateIterationComparison(iterations);
}

/** Get final optimization report */
export function getFinalReport(session: OptimizationSession): string {
    return generateFinalReport(
        session.iterationHistory.map((iter) => ({
            iteration: iter.iteration,
            config: iter.config,
            summary: iter.summary,
            adjustments: iter.adjustments,
        })),
    );
}

/** Run full optimization loop with provided adjustment callback */
export async function runFullOptimization(
    options: {
        maxIterations?: number;
        simulationDurationMs?: number;
        runsPerStrategy?: number;
        tickIntervalMs?: number;
        initialConfig?: BalanceConfig;
    },
    getAdjustments: (report: string, iteration: number) => Promise<string>,
): Promise<OptimizationSession> {
    let session = createOptimizationSession(options);

    while (session.currentIteration < session.maxIterations) {
        // Run iteration
        session = runIteration(session);

        console.log('\n' + session.lastReport);
        console.log('\n---\n');

        // Get adjustments from callback (could be AI, user input, etc.)
        const adjustmentsJson = await getAdjustments(
            session.lastReport,
            session.currentIteration,
        );

        // Apply adjustments
        session = applyAdjustmentsToSession(session, adjustmentsJson);

        if (session.status === 'completed') {
            break;
        }
    }

    console.log('\n' + getFinalReport(session));

    return session;
}

/** Quick run for testing - runs one iteration and returns report */
export function quickRun(
    durationMs = 300000, // 5 minutes
    runsPerStrategy = 5,
): string {
    const session = createOptimizationSession({
        maxIterations: 1,
        simulationDurationMs: durationMs,
        runsPerStrategy,
        tickIntervalMs: 100,
    });

    const afterRun = runIteration(session);
    return afterRun.lastReport;
}

/** Export current config as JSON for game integration */
export function exportConfigAsJson(session: OptimizationSession): string {
    return JSON.stringify(session.currentConfig, null, 2);
}

/** Import config from JSON */
export function importConfigFromJson(json: string): BalanceConfig {
    return JSON.parse(json) as BalanceConfig;
}
