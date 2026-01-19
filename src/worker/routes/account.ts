import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { usersTable } from '../../db/schema';
import { createDb } from '../lib/db';
import { sessionMiddleware, requireAuth } from '../middleware/session';
import type { AppEnv } from '../types';

export const accountRoutes = new Hono<AppEnv>();

accountRoutes.use('*', sessionMiddleware);

const profileSchema = z.object({
    publicName: z.string().min(1).max(50).optional(),
    hackerAlias: z.string().min(1).max(50).optional(),
});

accountRoutes.patch(
    '/profile',
    requireAuth,
    zValidator('json', profileSchema),
    async (c) => {
        const userId = c.get('userId');
        if (!userId) return c.json({ error: 'Unauthorized' }, 401);
        const updates = c.req.valid('json');
        const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

        const result = await db
            .update(usersTable)
            .set(updates)
            .where(eq(usersTable.id, userId))
            .returning({
                id: usersTable.id,
                name: usersTable.name,
                email: usersTable.email,
                publicName: usersTable.publicName,
                hackerAlias: usersTable.hackerAlias,
            });

        return c.json({ user: result[0] });
    },
);
