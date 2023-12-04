import {
    createContext,
    Dispatch,
    ReactNode,
    useContext,
    useMemo,
    useReducer,
} from 'react';
import { IncomeAction, gameReducer, INITIAL_GAME_STATE } from '.';

type IncomeContextType = {
    state: typeof INITIAL_GAME_STATE;
    dispatch: Dispatch<IncomeAction>;
};

const GlobalStateContext = createContext({} as IncomeContextType);

export const GlobalStateProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(gameReducer, INITIAL_GAME_STATE);

    const stateMemo = useMemo(() => {
        return { state, dispatch };
    }, [state, dispatch]);

    return (
        <GlobalStateContext.Provider value={stateMemo}>
            {children}
        </GlobalStateContext.Provider>
    );
};

export const useGlobalStateProvider = () => useContext(GlobalStateContext);
