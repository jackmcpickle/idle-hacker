import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { gameStatesTable } from '../../db/schema';
import { createDb } from '../lib/db';
import { sessionMiddleware, requireAuth } from '../middleware/session';
import type { AppEnv } from '../types';

export const gameRoutes = new Hono<AppEnv>();

gameRoutes.use('*', sessionMiddleware);

gameRoutes.get('/state', requireAuth, async (c) => {
    const userId = c.get('userId');
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);
    const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

    const gameState = await db
        .select()
        .from(gameStatesTable)
        .where(eq(gameStatesTable.userId, userId))
        .get();

    if (!gameState) {
        return c.json({ state: null });
    }

    return c.json({
        state: gameState.state,
        updatedAt: gameState.updatedAt.getTime(),
    });
});

const syncSchema = z.object({
    state: z.record(z.unknown()),
});

gameRoutes.post(
    '/sync',
    requireAuth,
    zValidator('json', syncSchema),
    async (c) => {
        const userId = c.get('userId');
        if (!userId) return c.json({ error: 'Unauthorized' }, 401);
        const { state } = c.req.valid('json');
        const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

        const existing = await db
            .select({ id: gameStatesTable.id })
            .from(gameStatesTable)
            .where(eq(gameStatesTable.userId, userId))
            .get();

        const now = new Date();

        if (existing) {
            await db
                .update(gameStatesTable)
                .set({ state, updatedAt: now })
                .where(eq(gameStatesTable.userId, userId));
        } else {
            await db.insert(gameStatesTable).values({
                userId,
                state,
                updatedAt: now,
            });
        }

        return c.json({ success: true, syncedAt: now.getTime() });
    },
);
