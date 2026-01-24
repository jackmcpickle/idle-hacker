import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, isNull, gt } from 'drizzle-orm';
import {
    usersTable,
    sessionsTable,
    magicLinksTable,
    pinCodesTable,
} from '../../db/schema';
import { createDb } from '../lib/db';
import { sendMagicLinkEmail } from '../lib/resend';
import {
    generateMagicLinkToken,
    generateSessionId,
    generatePinCode,
    getMagicLinkExpiresAt,
    getSessionExpiresAt,
    setSessionCookie,
    clearSessionCookie,
} from '../lib/session';
import { sessionMiddleware, requireAuth } from '../middleware/session';
import type { AppEnv } from '../types';

export const authRoutes = new Hono<AppEnv>();

authRoutes.use('*', sessionMiddleware);

const sendLinkSchema = z.object({
    email: z.string().email(),
});

authRoutes.post('/send-link', zValidator('json', sendLinkSchema), async (c) => {
    const { email } = c.req.valid('json');
    const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

    const token = generateMagicLinkToken();
    const pin = generatePinCode();
    const expiresAt = getMagicLinkExpiresAt();

    await db.insert(magicLinksTable).values({
        token,
        email,
        expiresAt,
    });

    await db.insert(pinCodesTable).values({
        email,
        pin,
        expiresAt,
    });

    const baseUrl = new URL(c.req.url).origin;
    const sent = await sendMagicLinkEmail(
        c.env.RESEND_API_KEY,
        email,
        token,
        baseUrl,
        pin,
    );

    if (!sent) {
        return c.json({ error: 'Failed to send email' }, 500);
    }

    return c.json({ success: true });
});

authRoutes.get('/verify', async (c) => {
    const token = c.req.query('token');
    if (!token) {
        return c.redirect('/login?error=invalid_token');
    }

    const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

    const magicLink = await db
        .select()
        .from(magicLinksTable)
        .where(eq(magicLinksTable.token, token))
        .get();

    if (!magicLink || magicLink.usedAt || magicLink.expiresAt < new Date()) {
        return c.redirect('/login?error=invalid_token');
    }

    await db
        .update(magicLinksTable)
        .set({ usedAt: new Date() })
        .where(eq(magicLinksTable.token, token));

    let user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, magicLink.email))
        .get();

    if (!user) {
        const result = await db
            .insert(usersTable)
            .values({
                email: magicLink.email,
                name: magicLink.email.split('@')[0],
            })
            .returning();
        user = result[0];
    }

    const sessionId = generateSessionId();
    const expiresAt = getSessionExpiresAt();

    await db.insert(sessionsTable).values({
        id: sessionId,
        userId: user.id,
        expiresAt,
    });

    setSessionCookie(c, sessionId);
    return c.redirect('/income');
});

const verifyPinSchema = z.object({
    email: z.string().email(),
    pin: z.string().length(6),
});

authRoutes.post(
    '/verify-pin',
    zValidator('json', verifyPinSchema),
    async (c) => {
        const { email, pin } = c.req.valid('json');
        const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

        const pinCode = await db
            .select()
            .from(pinCodesTable)
            .where(
                and(
                    eq(pinCodesTable.email, email),
                    eq(pinCodesTable.pin, pin),
                    isNull(pinCodesTable.usedAt),
                    gt(pinCodesTable.expiresAt, new Date()),
                ),
            )
            .get();

        if (!pinCode) {
            return c.json({ error: 'Invalid or expired code' }, 400);
        }

        await db
            .update(pinCodesTable)
            .set({ usedAt: new Date() })
            .where(eq(pinCodesTable.id, pinCode.id));

        let user = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email))
            .get();

        if (!user) {
            const result = await db
                .insert(usersTable)
                .values({
                    email,
                    name: email.split('@')[0],
                })
                .returning();
            user = result[0];
        }

        const sessionId = generateSessionId();
        const expiresAt = getSessionExpiresAt();

        await db.insert(sessionsTable).values({
            id: sessionId,
            userId: user.id,
            expiresAt,
        });

        setSessionCookie(c, sessionId);
        return c.json({ success: true });
    },
);

authRoutes.post('/logout', requireAuth, async (c) => {
    const sessionId = c.get('sessionId');
    const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

    if (sessionId) {
        await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
    }

    clearSessionCookie(c);
    return c.json({ success: true });
});

authRoutes.get('/me', async (c) => {
    const userId = c.get('userId');
    if (!userId) {
        return c.json({ user: null });
    }

    const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);
    const user = await db
        .select({
            id: usersTable.id,
            name: usersTable.name,
            email: usersTable.email,
            publicName: usersTable.publicName,
            hackerAlias: usersTable.hackerAlias,
        })
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .get();

    return c.json({ user });
});
