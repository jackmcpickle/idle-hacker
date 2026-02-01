/**
 * AI-Friendly Report Generation
 *
 * Generates structured reports that can be parsed by AI for optimization decisions.
 */

import type { BatchResult, BatchSummary } from './runner';
import type { BalanceConfig, ConfigAdjustment } from './config';

/** Format large numbers for readability */
function formatNumber(n: number): string {
    if (n >= 1e15) return `${(n / 1e15).toFixed(2)}Q`;
    if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
    return n.toFixed(2);
}

/** Format duration in human readable form */
function formatDuration(ms: number): string {
    if (ms >= 3600000) return `${(ms / 3600000).toFixed(1)}h`;
    if (ms >= 60000) return `${(ms / 60000).toFixed(1)}m`;
    if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
    return `${ms}ms`;
}

/** Generate a comprehensive report for AI analysis */
export function generateAIReport(
    batchResult: BatchResult,
    iteration: number,
): string {
    const lines: string[] = [];

    lines.push(`# Balance Simulation Report - Iteration ${iteration}`);
    lines.push('');
    lines.push(`## Configuration`);
    lines.push(`- Config Version: ${batchResult.config.version}`);
    lines.push(
        `- Simulation Duration: ${formatDuration(batchResult.durationMs)}`,
    );
    lines.push(`- Runs Per Strategy: ${batchResult.runCount}`);
    lines.push(`- Strategies Tested: ${batchResult.strategies.join(', ')}`);
    lines.push('');

    // Overall summary
    lines.push(`## Overall Results`);
    lines.push(
        `- Average Progression Score: ${batchResult.summary.overallAvgScore.toFixed(2)}`,
    );
    lines.push(
        `- Best Performing Strategy: ${batchResult.summary.bestStrategy}`,
    );
    lines.push(
        `- Worst Performing Strategy: ${batchResult.summary.worstStrategy}`,
    );
    lines.push('');

    // Strategy breakdown
    lines.push(`## Strategy Performance`);
    lines.push('');
    for (const [stratName, stats] of Object.entries(
        batchResult.summary.byStrategy,
    )) {
        lines.push(`### ${stratName}`);
        lines.push(
            `- Progression Score: ${stats.avgProgressionScore.toFixed(2)}`,
        );
        lines.push(`- Total Earned: ${formatNumber(stats.avgTotalEarned)}`);
        lines.push(`- Influence: ${formatNumber(stats.avgInfluence)}`);
        lines.push(`- Hacks Completed: ${stats.avgHacksCompleted.toFixed(1)}`);
        lines.push(
            `- Bottleneck Count: ${stats.avgBottleneckCount.toFixed(1)}`,
        );
        lines.push('');
        lines.push('Tier Unlock Rates:');
        for (const [tier, pct] of Object.entries(stats.tierUnlockPercentages)) {
            const status = pct >= 80 ? '✓' : pct >= 50 ? '~' : '✗';
            lines.push(`  ${status} ${tier}: ${pct.toFixed(0)}%`);
        }
        lines.push('');
    }

    // Current balance values
    lines.push(`## Current Balance Values`);
    lines.push('');
    lines.push('### Income Types');
    lines.push('| Name | Cost | Income | Cooldown | Unlock At |');
    lines.push('|------|------|--------|----------|-----------|');
    for (const inc of batchResult.config.incomeTypes) {
        lines.push(
            `| ${inc.name} | ${formatNumber(inc.cost)} | ${formatNumber(inc.income)} | ${formatDuration(inc.countdown)} | ${formatNumber(inc.unlockIncome)} |`,
        );
    }
    lines.push('');

    lines.push('### Hardware');
    lines.push('| ID | Base Cost | Multiplier | Speed Bonus | Max Level |');
    lines.push('|----|-----------|------------|-------------|-----------|');
    for (const hw of batchResult.config.hardware) {
        lines.push(
            `| ${hw.id} | ${formatNumber(hw.baseCost)} | ${hw.costMultiplier}x | +${(hw.speedBonusPerLevel * 100).toFixed(0)}%/lvl | ${hw.maxLevel} |`,
        );
    }
    lines.push('');

    lines.push('### Hacking Jobs');
    lines.push('| ID | Duration | Cost | Reward | Requirements |');
    lines.push('|----|----------|------|--------|--------------|');
    for (const hack of batchResult.config.hackJobs) {
        const reqs = Object.entries(hack.requiredHardware)
            .map(([k, v]) => `${k}:${v}`)
            .join(', ');
        lines.push(
            `| ${hack.id} | ${formatDuration(hack.duration)} | ${formatNumber(hack.cost)} | ${formatNumber(hack.influenceReward)} | ${reqs} |`,
        );
    }
    lines.push('');

    // Recommendations
    lines.push(`## Identified Issues`);
    if (batchResult.summary.recommendations.length === 0) {
        lines.push('No major issues identified.');
    } else {
        for (const rec of batchResult.summary.recommendations) {
            lines.push(`- ${rec}`);
        }
    }
    lines.push('');

    // Request for adjustments
    lines.push(`## Adjustment Request`);
    lines.push('');
    lines.push(
        'Based on the above data, please suggest balance adjustments in the following JSON format:',
    );
    lines.push('');
    lines.push('```json');
    lines.push('[');
    lines.push(
        '  { "type": "income_cost", "target": "Income Name", "percent": -10 },',
    );
    lines.push(
        '  { "type": "hardware_multiplier", "target": "cpu", "percent": -5 },',
    );
    lines.push(
        '  { "type": "hack_cost", "target": "wifi-crack", "percent": -20 }',
    );
    lines.push(']');
    lines.push('```');
    lines.push('');
    lines.push('Available adjustment types:');
    lines.push(
        '- income_cost, income_reward, income_cooldown (target: income name)',
    );
    lines.push(
        '- hardware_cost, hardware_multiplier, hardware_speed (target: cpu/ram/hdd/network/router)',
    );
    lines.push('- hack_cost, hack_duration, hack_reward (target: hack id)');
    lines.push(
        '- global_income_scaling, global_hardware_scaling, global_hack_scaling (no target needed)',
    );
    lines.push('');
    lines.push('Positive percent = increase, negative = decrease');
    lines.push('');

    return lines.join('\n');
}

/** Generate a summary comparing multiple iterations */
export function generateIterationComparison(
    iterations: Array<{
        iteration: number;
        summary: BatchSummary;
        configVersion: number;
    }>,
): string {
    const lines: string[] = [];

    lines.push('# Balance Optimization Progress');
    lines.push('');
    lines.push(
        '| Iteration | Config Ver | Avg Score | Best Strategy | Recommendations |',
    );
    lines.push(
        '|-----------|------------|-----------|---------------|-----------------|',
    );

    for (const iter of iterations) {
        lines.push(
            `| ${iter.iteration} | v${iter.configVersion} | ${iter.summary.overallAvgScore.toFixed(2)} | ${iter.summary.bestStrategy} | ${iter.summary.recommendations.length} |`,
        );
    }

    lines.push('');

    // Score trend
    if (iterations.length > 1) {
        const first = iterations[0].summary.overallAvgScore;
        const last = iterations[iterations.length - 1].summary.overallAvgScore;
        const change = ((last - first) / first) * 100;
        lines.push(
            `Score changed by ${change >= 0 ? '+' : ''}${change.toFixed(1)}% across iterations`,
        );
    }

    return lines.join('\n');
}

/** Parse AI-suggested adjustments from JSON */
export function parseAdjustments(json: string): ConfigAdjustment[] {
    try {
        // Extract JSON from markdown code block if present
        const jsonMatch = json.match(/```(?:json)?\s*([\s\S]*?)```/);
        const cleanJson = jsonMatch ? jsonMatch[1].trim() : json.trim();

        const parsed = JSON.parse(cleanJson);

        if (!Array.isArray(parsed)) {
            throw new Error('Adjustments must be an array');
        }

        return parsed.map((adj: Record<string, unknown>) => {
            if (!adj.type || typeof adj.percent !== 'number') {
                throw new Error('Each adjustment needs type and percent');
            }
            return {
                type: adj.type as ConfigAdjustment['type'],
                target: adj.target as string | undefined,
                percent: adj.percent as number,
            };
        });
    } catch (e) {
        console.error('Failed to parse adjustments:', e);
        return [];
    }
}

/** Generate a final report with all iteration history */
export function generateFinalReport(
    iterations: Array<{
        iteration: number;
        config: BalanceConfig;
        summary: BatchSummary;
        adjustments: ConfigAdjustment[];
    }>,
): string {
    const lines: string[] = [];

    lines.push('# Final Balance Optimization Report');
    lines.push('');
    lines.push(`## Summary`);
    lines.push(`- Total Iterations: ${iterations.length}`);
    lines.push(
        `- Starting Score: ${iterations[0]?.summary.overallAvgScore.toFixed(2) ?? 'N/A'}`,
    );
    lines.push(
        `- Final Score: ${iterations[iterations.length - 1]?.summary.overallAvgScore.toFixed(2) ?? 'N/A'}`,
    );
    lines.push('');

    lines.push('## Iteration History');
    lines.push('');

    for (const iter of iterations) {
        lines.push(`### Iteration ${iter.iteration}`);
        lines.push(`- Avg Score: ${iter.summary.overallAvgScore.toFixed(2)}`);
        lines.push(`- Best Strategy: ${iter.summary.bestStrategy}`);

        if (iter.adjustments.length > 0) {
            lines.push('- Adjustments Applied:');
            for (const adj of iter.adjustments) {
                const target = adj.target ? ` on ${adj.target}` : '';
                lines.push(
                    `  - ${adj.type}${target}: ${adj.percent >= 0 ? '+' : ''}${adj.percent}%`,
                );
            }
        }
        lines.push('');
    }

    // Final recommended values
    const finalConfig = iterations[iterations.length - 1]?.config;
    if (finalConfig) {
        lines.push('## Final Recommended Values');
        lines.push('');
        lines.push('### Income Types');
        for (const inc of finalConfig.incomeTypes) {
            lines.push(
                `- ${inc.name}: cost=${formatNumber(inc.cost)}, income=${formatNumber(inc.income)}, cooldown=${formatDuration(inc.countdown)}`,
            );
        }
        lines.push('');

        lines.push('### Hardware');
        for (const hw of finalConfig.hardware) {
            lines.push(
                `- ${hw.id}: baseCost=${formatNumber(hw.baseCost)}, multiplier=${hw.costMultiplier}x, speedBonus=${(hw.speedBonusPerLevel * 100).toFixed(0)}%/lvl`,
            );
        }
        lines.push('');

        lines.push('### Hacking Jobs');
        for (const hack of finalConfig.hackJobs) {
            lines.push(
                `- ${hack.id}: cost=${formatNumber(hack.cost)}, duration=${formatDuration(hack.duration)}, reward=${formatNumber(hack.influenceReward)}`,
            );
        }
    }

    return lines.join('\n');
}
