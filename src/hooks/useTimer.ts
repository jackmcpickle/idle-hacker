import type { IncomeType } from '@/models/IncomeType';
import { useGlobalStateProvider } from '@/state/context';

export function useTimer(incomeType: IncomeType): {
    time: number;
    percent: number;
} {
    const { state } = useGlobalStateProvider();

    // Calculate hardware speed bonus
    const hardwareSpeedBonus = state.hardware.reduce(
        (sum, hw) => sum + hw.getSpeedBonus(),
        0,
    );
    const speedMultiplier = 1 + hardwareSpeedBonus;

    const lastCollected =
        state.incomeTimers[incomeType.name] ?? state.globalTick;
    const elapsed = state.globalTick - lastCollected;
    // Apply hardware speed bonus to countdown
    const countdown = incomeType.getCountdown() / speedMultiplier;
    const time = Math.min(elapsed, countdown);

    return {
        time,
        percent: incomeType.isFastCountdown() ? 100 : (time / countdown) * 100,
    };
}
