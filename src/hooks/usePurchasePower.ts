import { IncomeType } from '@/models/incomes';
import { useGlobalStateProvider } from '@/state/context';
import { roundHigh } from '@/utils/round';
import { useMemo } from 'react';

export const usePurchasePower = (incomeType: IncomeType) => {
    const { state } = useGlobalStateProvider();

    const purchaseQty = useMemo((): number => {
        return state.purchaseMultiplier.isPercent
            ? Math.floor((state.bank * (parseInt(state.purchaseMultiplier.value, 10) / 100)) / incomeType.getCost())
            : parseInt(state.purchaseMultiplier.value, 10);
    }, [state, incomeType]);

    const canAfford = useMemo(() => state.bank >= incomeType.getCost() * purchaseQty, [purchaseQty, state, incomeType]);

    return {
        canAfford,
        purchaseQty: roundHigh(purchaseQty),
    };
};
