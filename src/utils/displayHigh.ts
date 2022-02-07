export function displayHigh(number: number): string {
    const exponentNumber = Number(number).toExponential();
    const precisionNumber = exponentNumber.split('e+')[0];
    const exponentLength = exponentNumber.split('e+')[1];
    const length = number.toString().length;
    if (length < 7) {
        return `${number}`;
    }
    return parseFloat(precisionNumber).toFixed(2) + 'e+' + exponentLength;
}
