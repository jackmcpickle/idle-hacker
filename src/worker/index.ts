import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authRoutes } from './routes/auth';
import { gameRoutes } from './routes/game';
import { accountRoutes } from './routes/account';
import type { AppEnv } from './types';

const app = new Hono<AppEnv>();

app.use('*', logger());
app.use(
    '/api/*',
    cors({
        origin: (origin) => origin,
        credentials: true,
    }),
);

app.route('/api/auth', authRoutes);
app.route('/api/game', gameRoutes);
app.route('/api/account', accountRoutes);

app.get('/api/health', (c) => c.json({ status: 'ok' }));

export default app;
