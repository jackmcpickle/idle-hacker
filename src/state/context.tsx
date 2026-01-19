import {
    createContext,
    type Dispatch,
    type ReactElement,
    type ReactNode,
    useContext,
    useMemo,
    useReducer,
} from 'react';
import {
    type GameAction,
    type GameContext,
    gameReducer,
    INITIAL_GAME_STATE,
} from '.';

type GameContextType = {
    state: GameContext;
    dispatch: Dispatch<GameAction>;
};

const GlobalStateContext = createContext({} as GameContextType);

export function GlobalStateProvider({
    children,
}: {
    children: ReactNode;
}): ReactElement {
    const [state, dispatch] = useReducer(gameReducer, INITIAL_GAME_STATE);

    const stateMemo = useMemo(() => {
        return { state, dispatch };
    }, [state, dispatch]);

    return (
        <GlobalStateContext.Provider value={stateMemo}>
            {children}
        </GlobalStateContext.Provider>
    );
}

export function useGlobalStateProvider(): GameContextType {
    return useContext(GlobalStateContext);
}
