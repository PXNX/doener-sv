// src/lib/server/auth.ts
import { Google } from 'arctic';
import { env } from '$env/dynamic/private';
import { db } from './db';
import { eq } from 'drizzle-orm';
import { sessions, users } from './schema';

export const google = new Google(
	env.GOOGLE_CLIENT_ID ?? '',
	env.GOOGLE_CLIENT_SECRET ?? '',
	env.GOOGLE_REDIRECT_URI ?? ''
);

const SESSION_TOKEN_BYTES = 20;

function hashSessionToken(token: string): string {
	return new Bun.CryptoHasher('sha256').update(token).digest('hex');
}

export function generateSessionToken(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(SESSION_TOKEN_BYTES));
	return Buffer.from(bytes).toString('base64url');
}

export async function createSession(token: string, userId: string) {
	const sessionId = hashSessionToken(token);
	const session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 days
	};
	await db.insert(sessions).values(session);
	return session;
}

export async function validateSessionToken(token: string) {
	const sessionId = hashSessionToken(token);
	const result = await db
		.select({ user: users, session: sessions })
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(eq(sessions.id, sessionId));

	if (result.length === 0) return null;

	const { user, session } = result[0];

	if (Date.now() >= session.expiresAt.getTime()) {
		await db.delete(sessions).where(eq(sessions.id, session.id));
		return null;
	}

	return { session, user };
}

export async function invalidateSession(sessionId: string) {
	await db.delete(sessions).where(eq(sessions.id, sessionId));
}
