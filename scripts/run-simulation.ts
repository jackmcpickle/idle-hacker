/**
 * CLI Script for Running Balance Simulations
 *
 * Run with: npx tsx scripts/run-simulation.ts [options]
 *
 * Options:
 *   --quick           Run a quick test (5 min sim, 5 runs)
 *   --ai              Use Claude Haiku 4.5 for AI-driven optimization
 *   --duration=N      Simulation duration in minutes (default: 30)
 *   --runs=N          Runs per strategy (default: 20)
 *   --iterations=N    Max optimization iterations (default: 1, or 10 with --ai)
 *   --output=FILE     Output report to file
 *
 * Environment:
 *   ANTHROPIC_API_KEY - Required for --ai mode
 *
 * Examples:
 *   pnpm simulate --quick                 # Quick 5-minute test
 *   pnpm simulate --duration=10 --runs=10 # 10-min sim, 10 runs per strategy
 *   pnpm simulate --ai --iterations=5     # AI optimization with 5 iterations
 */

import {
    quickRun,
    createOptimizationSession,
    runIteration,
    getFinalReport,
    getIterationComparison,
    runAIOptimization,
    exportConfigAsJson,
} from '../src/simulation';
import * as fs from 'fs';

type Args = {
    quick: boolean;
    ai: boolean;
    duration: number;
    runs: number;
    iterations: number;
    output: string | null;
};

function parseArgs(): Args {
    const args = process.argv.slice(2);
    const result: Args = {
        quick: false,
        ai: false,
        duration: 30,
        runs: 20,
        iterations: 1,
        output: null,
    };

    for (const arg of args) {
        if (arg === '--quick') {
            result.quick = true;
        } else if (arg === '--ai') {
            result.ai = true;
            // Default to 10 iterations for AI mode
            if (result.iterations === 1) {
                result.iterations = 10;
            }
        } else if (arg.startsWith('--duration=')) {
            result.duration = parseInt(arg.split('=')[1], 10);
        } else if (arg.startsWith('--runs=')) {
            result.runs = parseInt(arg.split('=')[1], 10);
        } else if (arg.startsWith('--iterations=')) {
            result.iterations = parseInt(arg.split('=')[1], 10);
        } else if (arg.startsWith('--output=')) {
            result.output = arg.split('=')[1];
        }
    }

    return result;
}

async function runQuickMode(output: string | null): Promise<void> {
    console.log('Running quick test (5 minute simulation, 5 runs per strategy)...\n');
    const report = quickRun(300000, 5);
    console.log(report);

    if (output) {
        fs.writeFileSync(output, report);
        console.log(`\nReport saved to: ${output}`);
    }
}

async function runAIMode(args: Args): Promise<void> {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
        console.error('Error: ANTHROPIC_API_KEY environment variable is required for --ai mode');
        console.error('');
        console.error('Set it with:');
        console.error('  export ANTHROPIC_API_KEY=your-api-key');
        console.error('');
        console.error('Or run without AI:');
        console.error('  pnpm simulate --duration=10 --runs=10');
        process.exit(1);
    }

    const durationMs = args.duration * 60 * 1000;

    console.log('=== AI-Driven Balance Optimization ===');
    console.log('Using Claude Haiku 4.5 for analysis');
    console.log('');

    const result = await runAIOptimization({
        apiKey,
        maxIterations: args.iterations,
        simulationDurationMs: durationMs,
        runsPerStrategy: args.runs,
        tickIntervalMs: 100,
        onProgress: console.log,
    });

    if (result.success) {
        console.log('\n' + result.finalReport);

        if (args.output) {
            // Save final config as JSON
            const configPath = args.output.replace(/\.[^.]+$/, '-config.json');
            fs.writeFileSync(configPath, exportConfigAsJson({
                maxIterations: args.iterations,
                currentIteration: args.iterations,
                simulationDurationMs: durationMs,
                runsPerStrategy: args.runs,
                tickIntervalMs: 100,
                currentConfig: result.finalConfig,
                iterationHistory: [],
                status: 'completed',
                lastReport: '',
            }));

            // Save full report
            fs.writeFileSync(args.output, result.finalReport);

            console.log(`\nReport saved to: ${args.output}`);
            console.log(`Config saved to: ${configPath}`);
        }
    } else {
        console.error(`\nOptimization failed: ${result.error}`);
        process.exit(1);
    }
}

async function runManualMode(args: Args): Promise<void> {
    const durationMs = args.duration * 60 * 1000;

    console.log(`Configuration:`);
    console.log(`  - Simulation duration: ${args.duration} minutes`);
    console.log(`  - Runs per strategy: ${args.runs}`);
    console.log(`  - Max iterations: ${args.iterations}`);
    console.log('');

    let session = createOptimizationSession({
        maxIterations: args.iterations,
        simulationDurationMs: durationMs,
        runsPerStrategy: args.runs,
        tickIntervalMs: 100,
    });

    const startTime = Date.now();

    // Run iterations
    for (let i = 0; i < args.iterations; i++) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Iteration ${i + 1}/${args.iterations}`);
        console.log('='.repeat(60) + '\n');

        session = runIteration(session);

        console.log(session.lastReport);

        // If more iterations remaining, show what adjustments could be applied
        if (i < args.iterations - 1) {
            console.log('\n--- End of Iteration ---');
            console.log('(Use --ai flag to enable AI-driven adjustments)\n');
            // For non-interactive mode, we just continue without adjustments
            session = {
                ...session,
                status: 'ready',
            };
        }
    }

    const endTime = Date.now();
    const totalDuration = (endTime - startTime) / 1000;

    console.log(`\n${'='.repeat(60)}`);
    console.log('FINAL SUMMARY');
    console.log('='.repeat(60) + '\n');

    if (session.iterationHistory.length > 1) {
        console.log(getIterationComparison(session));
        console.log('');
    }

    const finalReport = getFinalReport(session);
    console.log(finalReport);

    console.log(`\nTotal execution time: ${totalDuration.toFixed(1)}s`);

    if (args.output) {
        const fullReport = [
            session.lastReport,
            '',
            '---',
            '',
            getIterationComparison(session),
            '',
            finalReport,
        ].join('\n');

        fs.writeFileSync(args.output, fullReport);
        console.log(`\nFull report saved to: ${args.output}`);
    }
}

async function main(): Promise<void> {
    const args = parseArgs();

    console.log('=== Idle Hacker Balance Simulation ===\n');

    if (args.quick) {
        await runQuickMode(args.output);
    } else if (args.ai) {
        await runAIMode(args);
    } else {
        await runManualMode(args);
    }
}

main().catch(console.error);
