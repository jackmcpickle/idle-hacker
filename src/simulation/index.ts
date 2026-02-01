/**
 * AI Testing Framework for Game Balance
 *
 * This module provides tools for simulating game progression,
 * testing different strategies, and optimizing balance parameters.
 *
 * Usage:
 *
 * ```typescript
 * import { quickRun, createOptimizationSession, runIteration } from '@/simulation';
 *
 * // Quick test run
 * const report = quickRun(300000, 5); // 5 min sim, 5 runs per strategy
 * console.log(report);
 *
 * // Full optimization loop
 * const session = createOptimizationSession({ maxIterations: 10 });
 * let currentSession = runIteration(session);
 * // ... get AI adjustments from report ...
 * currentSession = applyAdjustmentsToSession(currentSession, adjustmentsJson);
 * // ... repeat until done ...
 * ```
 */

// Types
export type {
    SimulationState,
    SimIncomeType,
    SimHardware,
    SimActiveHack,
    ProgressionSnapshot,
    StrategyAction,
    AIStrategy,
    SimulationConfig,
    SimulationResult,
    BalanceMetrics,
    BottleneckInfo,
} from './types';

// Config
export type {
    IncomeConfig,
    HardwareConfig,
    HackConfig,
    LevelTier,
    BalanceConfig,
    ConfigAdjustment,
} from './config';
export {
    DEFAULT_BALANCE_CONFIG,
    cloneConfig,
    adjustValue,
    applyConfigAdjustments,
} from './config';

// Engine
export {
    createInitialState,
    calculateIncomePerSecond,
    getHardwareSpeedBonus,
    getHardwareCost,
    calculateMaxHackSlots,
    processTick,
    applyAction,
    takeSnapshot,
    isIncomeUnlocked,
    canStartHack,
    getAvailableHackSlot,
} from './engine';

// Strategies
export {
    createGreedyStrategy,
    createBalancedStrategy,
    createHackFocusedStrategy,
    createIncomeFirstStrategy,
    createRandomStrategy,
    getAllStrategies,
} from './strategies';

// Runner
export type { BatchResult, BatchSummary } from './runner';
export { runSimulation, runBatchSimulation } from './runner';

// Report
export {
    generateAIReport,
    generateIterationComparison,
    generateFinalReport,
    parseAdjustments,
} from './report';

// Optimizer
export type { OptimizationSession, IterationResult } from './optimizer';
export {
    createOptimizationSession,
    runIteration,
    applyAdjustmentsToSession,
    getIterationComparison,
    getFinalReport,
    runFullOptimization,
    quickRun,
    exportConfigAsJson,
    importConfigFromJson,
} from './optimizer';

// AI Optimizer (Claude Haiku 4.5)
export type {
    AIOptimizerConfig,
    AIOptimizationResult,
    AIIterationResult,
} from './ai-optimizer';
export { runAIOptimization, runSingleAIIteration } from './ai-optimizer';
