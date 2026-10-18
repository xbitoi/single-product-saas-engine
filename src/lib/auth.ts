import { cookies } from "next/headers";
import { env } from "./env";
import { prisma } from "./prisma";
import { verifyPassword } from "./password";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signSession,
  verifySessionToken,
  type SessionPayload,
} from "./session";

/** Owner auth can be switched off from the dashboard settings. */
export async function isAuthEnabled(): Promise<boolean> {
  try {
    const row = await prisma.setting.findUnique({ where: { id: "global" } });
    return row?.authEnabled ?? true;
  } catch {
    return true;
  }
}

/** Verifies against the dashboard-stored password, falling back to ADMIN_PASSWORD. */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const row = await prisma.setting
    .findUnique({ where: { id: "global" } })
    .catch(() => null);

  if (row?.adminPasswordHash) {
    return verifyPassword(password, row.adminPasswordHash);
  }

  const expected = env.ADMIN_PASSWORD;
  if (!expected) return false;
  if (password.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < password.length; i += 1) {
    diff |= password.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export async function createSession(): Promise<void> {
  const token = await signSession({ role: "admin" });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

/**
 * Guard for dashboard pages and admin routes: returns a session when auth is
 * satisfied, or when the owner has disabled auth protection entirely.
 */
export async function requireAdmin(): Promise<SessionPayload | null> {
  if (!(await isAuthEnabled())) return { role: "admin" };
  return getSession();
}
