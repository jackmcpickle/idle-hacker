import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, isNull, gt, lt } from 'drizzle-orm';
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
    try {
        const { email } = c.req.valid('json');
        const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

        const token = generateMagicLinkToken();
        const pin = generatePinCode();
        const expiresAt = getMagicLinkExpiresAt();

        const now = new Date();

        await db.insert(magicLinksTable).values({
            token,
            email,
            expiresAt,
            createdAt: now,
        });

        await db.insert(pinCodesTable).values({
            email,
            pin,
            expiresAt,
            createdAt: now,
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
    } catch (error) {
        console.error('send-link error:', error);
        const message =
            error instanceof Error ? error.message : 'Unknown error';
        return c.json({ error: message }, 500);
    }
});

authRoutes.get('/verify', async (c) => {
    try {
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

        if (
            !magicLink ||
            magicLink.usedAt ||
            magicLink.expiresAt < new Date()
        ) {
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

        const now = new Date();

        if (!user) {
            const result = await db
                .insert(usersTable)
                .values({
                    email: magicLink.email,
                    name: magicLink.email.split('@')[0],
                    createdAt: now,
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
            createdAt: now,
        });

        setSessionCookie(c, sessionId);
        return c.redirect('/income');
    } catch (error) {
        console.error('verify error:', error);
        return c.redirect('/login?error=server_error');
    }
});

const verifyPinSchema = z.object({
    email: z.string().email(),
    pin: z.string().regex(/^\d{6}$/, 'PIN must be 6 digits'),
});

const MAX_PIN_ATTEMPTS = 5;

authRoutes.post(
    '/verify-pin',
    zValidator('json', verifyPinSchema),
    async (c) => {
        try {
            const { email, pin } = c.req.valid('json');
            const db = createDb(
                c.env.TURSO_DATABASE_URL,
                c.env.TURSO_AUTH_TOKEN,
            );

            // Find the most recent valid PIN code for this email
            const pinCode = await db
                .select()
                .from(pinCodesTable)
                .where(
                    and(
                        eq(pinCodesTable.email, email),
                        isNull(pinCodesTable.usedAt),
                        gt(pinCodesTable.expiresAt, new Date()),
                        lt(pinCodesTable.attempts, MAX_PIN_ATTEMPTS),
                    ),
                )
                .get();

            if (!pinCode) {
                return c.json({ error: 'Invalid or expired code' }, 400);
            }

            // Check if PIN matches
            if (pinCode.pin !== pin) {
                await db
                    .update(pinCodesTable)
                    .set({ attempts: pinCode.attempts + 1 })
                    .where(eq(pinCodesTable.id, pinCode.id));

                const attemptsLeft = MAX_PIN_ATTEMPTS - pinCode.attempts - 1;
                if (attemptsLeft <= 0) {
                    return c.json(
                        { error: 'Too many attempts. Request a new code.' },
                        400,
                    );
                }
                return c.json({ error: 'Invalid code' }, 400);
            }

            await db
                .update(pinCodesTable)
                .set({ usedAt: new Date() })
                .where(eq(pinCodesTable.id, pinCode.id));

            const now = new Date();

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
                        createdAt: now,
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
                createdAt: now,
            });

            setSessionCookie(c, sessionId);
            return c.json({ success: true });
        } catch (error) {
            console.error('verify-pin error:', error);
            const message =
                error instanceof Error ? error.message : 'Unknown error';
            return c.json({ error: message }, 500);
        }
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
