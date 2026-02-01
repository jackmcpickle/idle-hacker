/**
 * AI-Driven Balance Optimizer
 *
 * Uses Anthropic Claude Haiku 4.5 to analyze simulation results
 * and suggest balance adjustments.
 */

import type { BalanceConfig, ConfigAdjustment } from './config';
import {
    DEFAULT_BALANCE_CONFIG,
    cloneConfig,
    applyConfigAdjustments,
} from './config';
import { runBatchSimulation } from './runner';
import { getAllStrategies } from './strategies';
import {
    generateAIReport,
    parseAdjustments,
    generateFinalReport,
} from './report';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL_ID = 'claude-haiku-4-5-20250514';

/** Configuration for AI optimization */
export type AIOptimizerConfig = {
    /** Anthropic API key */
    apiKey: string;
    /** Maximum optimization iterations (default: 10) */
    maxIterations?: number;
    /** Simulation duration in ms (default: 30 minutes) */
    simulationDurationMs?: number;
    /** Runs per strategy (default: 20) */
    runsPerStrategy?: number;
    /** Tick interval in ms (default: 100) */
    tickIntervalMs?: number;
    /** Initial balance config (default: current game values) */
    initialConfig?: BalanceConfig;
    /** Callback for progress updates */
    onProgress?: (message: string) => void;
};

/** Result of AI optimization */
export type AIOptimizationResult = {
    success: boolean;
    iterations: AIIterationResult[];
    finalConfig: BalanceConfig;
    finalReport: string;
    totalApiCalls: number;
    error?: string;
};

/** Result of a single AI iteration */
export type AIIterationResult = {
    iteration: number;
    report: string;
    aiResponse: string;
    adjustments: ConfigAdjustment[];
    configAfter: BalanceConfig;
    avgScore: number;
};

/** Call Anthropic API with the simulation report */
async function callAnthropicAPI(
    apiKey: string,
    report: string,
    iteration: number,
    maxIterations: number,
): Promise<string> {
    const systemPrompt = `You are a game balance expert analyzing simulation results for an idle clicker game.
Your goal is to improve game balance by suggesting parameter adjustments.

Key principles:
1. Progression should feel smooth - no long stalls or sudden jumps
2. All strategies should be viable (no strategy should be 2x better than others)
3. Players should unlock new content at a steady pace
4. Hardware upgrades should feel impactful but not mandatory
5. Hacking jobs should be rewarding side activities

When suggesting adjustments:
- Make small, targeted changes (usually -20% to +20%)
- Focus on the biggest issues first
- Consider how changes cascade through the economy
- Aim for incremental improvement, not perfection

This is iteration ${iteration} of ${maxIterations}. ${iteration > 1 ? 'Review what has changed since previous iterations.' : ''}`;

    const userPrompt = `${report}

Based on this simulation data, suggest balance adjustments to improve the game.
Respond with ONLY a JSON array of adjustments, no other text.
Example: [{"type": "income_cost", "target": "Freelance Tasks", "percent": -15}]`;

    const response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: MODEL_ID,
            max_tokens: 1024,
            system: systemPrompt,
            messages: [
                {
                    role: 'user',
                    content: userPrompt,
                },
            ],
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `Anthropic API error: ${response.status} - ${errorText}`,
        );
    }

    const data = await response.json();
    return data.content[0].text;
}

/** Run AI-driven optimization loop */
export async function runAIOptimization(
    config: AIOptimizerConfig,
): Promise<AIOptimizationResult> {
    const {
        apiKey,
        maxIterations = 10,
        simulationDurationMs = 1800000,
        runsPerStrategy = 20,
        tickIntervalMs = 100,
        initialConfig = cloneConfig(DEFAULT_BALANCE_CONFIG),
        onProgress = console.log,
    } = config;

    const iterations: AIIterationResult[] = [];
    let currentConfig = cloneConfig(initialConfig);
    let totalApiCalls = 0;

    onProgress(`Starting AI-driven balance optimization`);
    onProgress(`Max iterations: ${maxIterations}`);
    onProgress(`Simulation duration: ${simulationDurationMs / 60000} minutes`);
    onProgress(`Runs per strategy: ${runsPerStrategy}`);
    onProgress('');

    try {
        for (let i = 0; i < maxIterations; i++) {
            const iterNum = i + 1;
            onProgress(`\n${'='.repeat(60)}`);
            onProgress(`ITERATION ${iterNum}/${maxIterations}`);
            onProgress('='.repeat(60));

            // Run batch simulation
            onProgress(`Running ${runsPerStrategy * 5} simulations...`);
            const strategies = getAllStrategies(currentConfig);
            const batchResult = runBatchSimulation(
                currentConfig,
                strategies,
                runsPerStrategy,
                simulationDurationMs,
                tickIntervalMs,
                100,
            );

            // Generate report
            const report = generateAIReport(batchResult, iterNum);
            onProgress(
                `Average progression score: ${batchResult.summary.overallAvgScore.toFixed(2)}`,
            );
            onProgress(`Best strategy: ${batchResult.summary.bestStrategy}`);

            // Call AI for adjustments
            onProgress(`Calling Claude Haiku 4.5 for analysis...`);
            const aiResponse = await callAnthropicAPI(
                apiKey,
                report,
                iterNum,
                maxIterations,
            );
            totalApiCalls++;

            // Parse adjustments
            const adjustments = parseAdjustments(aiResponse);
            onProgress(`AI suggested ${adjustments.length} adjustments:`);
            for (const adj of adjustments) {
                const target = adj.target ? ` on ${adj.target}` : '';
                onProgress(
                    `  - ${adj.type}${target}: ${adj.percent >= 0 ? '+' : ''}${adj.percent}%`,
                );
            }

            // Apply adjustments
            const configAfter = applyConfigAdjustments(
                currentConfig,
                adjustments,
            );

            // Store iteration result
            iterations.push({
                iteration: iterNum,
                report,
                aiResponse,
                adjustments,
                configAfter: cloneConfig(configAfter),
                avgScore: batchResult.summary.overallAvgScore,
            });

            currentConfig = configAfter;

            // Check for convergence (if AI suggests no changes)
            if (adjustments.length === 0) {
                onProgress(
                    `\nAI suggested no changes - optimization complete!`,
                );
                break;
            }
        }

        // Generate final report
        const finalReport = generateFinalReport(
            iterations.map((iter) => ({
                iteration: iter.iteration,
                config: iter.configAfter,
                summary: {
                    byStrategy: {},
                    overallAvgScore: iter.avgScore,
                    bestStrategy: '',
                    worstStrategy: '',
                    recommendations: [],
                },
                adjustments: iter.adjustments,
            })),
        );

        onProgress(`\n${'='.repeat(60)}`);
        onProgress('OPTIMIZATION COMPLETE');
        onProgress('='.repeat(60));
        onProgress(`Total iterations: ${iterations.length}`);
        onProgress(`Total API calls: ${totalApiCalls}`);
        onProgress(
            `Starting score: ${iterations[0]?.avgScore.toFixed(2) ?? 'N/A'}`,
        );
        onProgress(
            `Final score: ${iterations[iterations.length - 1]?.avgScore.toFixed(2) ?? 'N/A'}`,
        );

        return {
            success: true,
            iterations,
            finalConfig: currentConfig,
            finalReport,
            totalApiCalls,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        onProgress(`\nError during optimization: ${errorMessage}`);

        return {
            success: false,
            iterations,
            finalConfig: currentConfig,
            finalReport: '',
            totalApiCalls,
            error: errorMessage,
        };
    }
}

/** Run a single iteration of AI optimization (useful for interactive use) */
export async function runSingleAIIteration(
    apiKey: string,
    config: BalanceConfig,
    iteration: number,
    simulationDurationMs = 1800000,
    runsPerStrategy = 20,
): Promise<{
    report: string;
    adjustments: ConfigAdjustment[];
    newConfig: BalanceConfig;
}> {
    const strategies = getAllStrategies(config);
    const batchResult = runBatchSimulation(
        config,
        strategies,
        runsPerStrategy,
        simulationDurationMs,
        100,
        100,
    );

    const report = generateAIReport(batchResult, iteration);
    const aiResponse = await callAnthropicAPI(apiKey, report, iteration, 10);
    const adjustments = parseAdjustments(aiResponse);
    const newConfig = applyConfigAdjustments(config, adjustments);

    return { report, adjustments, newConfig };
}
