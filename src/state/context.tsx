import React, { createContext, Dispatch, useContext, useReducer } from 'react';
import { IncomeAction, gameReducer, INITIAL_GAME_STATE } from '.';
import { useTimer } from '../hooks/useTimer';

type IncomeContextType = {
    state: typeof INITIAL_GAME_STATE;
    dispatch: Dispatch<IncomeAction>;
};

const GlobalStateContext = createContext({} as IncomeContextType);

export const GlobalStateProvider = ({ children }) => {
    const [state, dispatch] = useReducer(gameReducer, INITIAL_GAME_STATE);

    return <GlobalStateContext.Provider value={(state, dispatch)}>{children}</GlobalStateContext.Provider>;
};

export const useGlobalStateProvider = () => useContext(GlobalStateContext);
