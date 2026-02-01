/**
 * AI Testing Framework Types
 *
 * UI-independent types for simulating game state and balance testing.
 */

import type { HardwareId } from '@/models/HardwareItem';
import type { HackJobId } from '@/models/HackingJob';

/** Simplified income type data for simulation */
export type SimIncomeType = {
    name: string;
    cost: number;
    income: number;
    countdown: number;
    inventory: number;
    timeMultiplier: number;
    incomeMultiplier: number;
    unlockIncome: number;
};

/** Hardware item data for simulation */
export type SimHardware = {
    id: HardwareId;
    name: string;
    baseCost: number;
    speedBonusPerLevel: number;
    maxLevel: number;
    level: number;
};

/** Active hack data for simulation */
export type SimActiveHack = {
    jobId: HackJobId;
    startedAt: number;
    endsAt: number;
    totalCostPaid: number;
    lastCostTick: number;
    totalPausedMs: number;
};

/** Core simulation state (no React dependencies) */
export type SimulationState = {
    bank: number;
    influence: number;
    totalEarned: number;
    totalSpent: number;
    totalHacksCompleted: number;
    incomeTypes: SimIncomeType[];
    hardware: SimHardware[];
    activeHacks: (SimActiveHack | null)[];
    maxHackSlots: number;
    incomeTimers: Record<string, number>;
    globalTick: number;
};

/** Snapshot for tracking progression over time */
export type ProgressionSnapshot = {
    tick: number;
    elapsedMs: number;
    bank: number;
    influence: number;
    totalEarned: number;
    totalSpent: number;
    incomePerSecond: number;
    totalInventory: number;
    hardwareLevels: Record<HardwareId, number>;
    activeHackCount: number;
    totalHacksCompleted: number;
};

/** Strategy decision types */
export type StrategyAction =
    | { type: 'buy_income'; name: string; quantity: number }
    | { type: 'upgrade_hardware'; id: HardwareId }
    | { type: 'start_hack'; jobId: HackJobId; slot: number }
    | { type: 'wait' };

/** Strategy interface */
export type AIStrategy = {
    name: string;
    description: string;
    decide(state: SimulationState): StrategyAction;
};

/** Simulation configuration */
export type SimulationConfig = {
    /** Maximum simulated time in ms */
    maxDurationMs: number;
    /** Simulation tick interval in ms (default: 100) */
    tickIntervalMs: number;
    /** How often to take snapshots (in ticks) */
    snapshotInterval: number;
    /** Strategy to use for decisions */
    strategy: AIStrategy;
    /** Optional seed for reproducibility */
    seed?: number;
};

/** Simulation result */
export type SimulationResult = {
    config: Omit<SimulationConfig, 'strategy'> & { strategyName: string };
    finalState: SimulationState;
    snapshots: ProgressionSnapshot[];
    totalTicks: number;
    realDurationMs: number;
    metrics: BalanceMetrics;
};

/** Balance analysis metrics */
export type BalanceMetrics = {
    /** Time to reach each income tier unlock (ms) */
    tierUnlockTimes: Record<string, number>;
    /** Time to max each hardware (ms) */
    hardwareMaxTimes: Record<HardwareId, number | null>;
    /** Time to complete first hack of each type (ms) */
    hackCompletionTimes: Record<HackJobId, number | null>;
    /** Income per second at various time points */
    incomeRateOverTime: Array<{ timeMs: number; incomePerSec: number }>;
    /** Bottlenecks identified during simulation */
    bottlenecks: BottleneckInfo[];
    /** Overall progression score (higher = faster) */
    progressionScore: number;
};

/** Bottleneck information */
export type BottleneckInfo = {
    /** Time when bottleneck was detected */
    timeMs: number;
    /** Type of bottleneck */
    type: 'income_stall' | 'hardware_gate' | 'hack_requirement' | 'cost_spike';
    /** Description of the bottleneck */
    description: string;
    /** Severity (1-10) */
    severity: number;
};
