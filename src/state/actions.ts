export const COLLECT_INCOME = 'COLLECT_INCOME';
export const INCREASE_QTY = 'INCREASE_QTY';
export const CHANGE_PURCHASE_MULTIPLIER = 'CHANGE_PURCHASE_MULTIPLIER';

export const increaseQty = (
    name: string,
    qty: number,
): { type: string; data: { name: string; qty: number } } => ({
    type: INCREASE_QTY,
    data: { name, qty },
});

export const collectIncome = (
    amount: number,
): { type: string; data: number } => ({
    type: COLLECT_INCOME,
    data: amount,
});

export const setPurchaseMultiplier = (
    value: string,
    isPercent: boolean,
): { type: string; data: { value: string; isPercent: boolean } } => ({
    type: CHANGE_PURCHASE_MULTIPLIER,
    data: { value, isPercent },
});
