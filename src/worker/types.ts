import type { Context } from 'hono';

export type Bindings = {
    TURSO_DATABASE_URL: string;
    TURSO_AUTH_TOKEN: string;
    RESEND_API_KEY: string;
    SESSION_SECRET: string;
    ASSETS: Fetcher;
};

export type Variables = {
    userId: number | null;
    sessionId: string | null;
};

export type AppEnv = {
    Bindings: Bindings;
    Variables: Variables;
};

export type AppContext = Context<AppEnv>;
