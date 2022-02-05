export function roundHigh(number: number): number {
    const parts = Math.round(number).toString().split('e+');
    return parts.length > 1 ? parseFloat(parseFloat(parts[0]).toFixed(2) + 'e+' + parts[1]) : number;
}
