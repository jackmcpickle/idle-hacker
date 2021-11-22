
export const DEPOSIT = 'DEPOSIT';
export const WITHDRAW = 'WITHDRAW';
export const PAY = 'PAY'
export const PAY_RISE = 'PAY_RISE'
export const TAX = 'TAX'
export const SPEND = 'SPEND'

export const spendToGain = ({ cost, income }) => ({ type: SPEND, data: { cost, income } })
