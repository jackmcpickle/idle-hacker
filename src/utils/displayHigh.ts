const SUFFIXES = [
    { threshold: 1e15, divisor: 1e15, suffix: 'Qa' }, // quadrillion
    { threshold: 1e12, divisor: 1e12, suffix: 'T' }, // trillion
    { threshold: 1e9, divisor: 1e9, suffix: 'B' }, // billion
    { threshold: 1e6, divisor: 1e6, suffix: 'M' }, // million
    { threshold: 1e5, divisor: 1e3, suffix: 'K' }, // starts at 100K, K = thousands
];

export function displayHigh(number: number): string {
    // Edge cases
    if (!Number.isFinite(number)) return String(number);
    if (number === 0) return '0';
    if (number < 0) return `-${displayHigh(Math.abs(number))}`;

    // Decimals below threshold
    if (number < 1e5) {
        return Number.isInteger(number) ? String(number) : number.toFixed(2);
    }

    // Switch to scientific at 10^16+
    if (number >= 1e16) {
        return number.toExponential(2);
    }

    // Compact notation
    for (const { threshold, divisor, suffix } of SUFFIXES) {
        if (number >= threshold) {
            const formatted = (number / divisor).toFixed(2);
            return `${parseFloat(formatted)}${suffix}`;
        }
    }

    return String(number);
}
