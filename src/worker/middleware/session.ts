import { createMiddleware } from 'hono/factory';
import { eq } from 'drizzle-orm';
import { sessionsTable } from '@/db/schema';
import { createDb } from '../lib/db';
import { getSessionId } from '../lib/session';
import type { AppEnv } from '../types';

export const sessionMiddleware = createMiddleware<AppEnv>(async (c, next) => {
    const sessionId = getSessionId(c);

    if (!sessionId) {
        c.set('userId', null);
        c.set('sessionId', null);
        return next();
    }

    const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);
    const session = await db
        .select()
        .from(sessionsTable)
        .where(eq(sessionsTable.id, sessionId))
        .get();

    if (!session || session.expiresAt < new Date()) {
        c.set('userId', null);
        c.set('sessionId', null);
        return next();
    }

    c.set('userId', session.userId);
    c.set('sessionId', sessionId);
    return next();
});

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
    const userId = c.get('userId');
    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    return next();
});
