import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import type { AppContext } from '../types';

const SESSION_COOKIE = 'session';
const SESSION_DURATION_DAYS = 30;

export function getSessionId(c: AppContext): string | undefined {
    return getCookie(c, SESSION_COOKIE);
}

export function setSessionCookie(c: AppContext, sessionId: string): void {
    setCookie(c, SESSION_COOKIE, sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: 'Lax',
        path: '/',
        maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
    });
}

export function clearSessionCookie(c: AppContext): void {
    deleteCookie(c, SESSION_COOKIE, { path: '/' });
}

export function generateSessionId(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

export function generateMagicLinkToken(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

export function getSessionExpiresAt(): Date {
    return new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);
}

export function getMagicLinkExpiresAt(): Date {
    return new Date(Date.now() + 15 * 60 * 1000); // 15 mins
}
