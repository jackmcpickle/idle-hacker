import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authRoutes } from './routes/auth';
import { gameRoutes } from './routes/game';
import { accountRoutes } from './routes/account';
import type { AppEnv } from './types';

const api = new Hono<AppEnv>();

api.use('*', logger());
api.use(
    '*',
    cors({
        origin: (origin) => origin,
        credentials: true,
    }),
);

api.route('/auth', authRoutes);
api.route('/game', gameRoutes);
api.route('/account', accountRoutes);

api.get('/health', (c) => c.json({ status: 'ok' }));

const app = new Hono<AppEnv>();
app.route('/api', api);

// Serve static assets - handled by @cloudflare/vite-plugin
app.get('*', (c) => {
    return c.env.ASSETS.fetch(c.req.raw);
});

// oxlint-disable-next-line import/no-default-export
export default app;
