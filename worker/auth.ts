// 비밀번호 해시(PBKDF2)와 로그인 세션

import type { Env } from './index';

const ITERATIONS = 100_000;
const enc = new TextEncoder();

function toHex(buf: ArrayBuffer | Uint8Array): string {
  return Array.from(buf instanceof Uint8Array ? buf : new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function randomHex(bytes: number): string {
  return toHex(crypto.getRandomValues(new Uint8Array(bytes)));
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function pbkdf2(password: string, salt: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS }, key, 256);
  return toHex(bits);
}

export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = randomHex(16);
  return { hash: await pbkdf2(password, fromHex(salt)), salt };
}

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  return safeEqual(await pbkdf2(password, fromHex(salt)), hash);
}

export async function verifyAdminPassword(env: Env, password: string): Promise<boolean> {
  const expected = env.ADMIN_PASSWORD;
  if (!expected) return false;
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(password)),
    crypto.subtle.digest('SHA-256', enc.encode(expected)),
  ]);
  return safeEqual(toHex(a), toHex(b));
}

export type SessionKind = 'org' | 'admin';
const COOKIE: Record<SessionKind, string> = { org: 'cb_org', admin: 'cb_admin' };
const TTL_HOURS: Record<SessionKind, number> = { org: 24 * 7, admin: 12 };

export async function createSession(env: Env, kind: SessionKind, orgId: number | null): Promise<string> {
  const token = randomHex(32);
  const expires = new Date(Date.now() + TTL_HOURS[kind] * 3600_000).toISOString();
  await env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(new Date().toISOString()).run();
  await env.DB.prepare('INSERT INTO sessions (token, kind, org_id, expires_at) VALUES (?, ?, ?, ?)')
    .bind(token, kind, orgId, expires)
    .run();
  return `${COOKIE[kind]}=${token}; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=${TTL_HOURS[kind] * 3600}`;
}

function readCookie(req: Request, name: string): string | null {
  const header = req.headers.get('Cookie') || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
}

export async function getSession(env: Env, req: Request, kind: SessionKind): Promise<{ token: string; orgId: number | null } | null> {
  const token = readCookie(req, COOKIE[kind]);
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  const row = await env.DB.prepare('SELECT org_id, expires_at FROM sessions WHERE token = ? AND kind = ?')
    .bind(token, kind)
    .first<{ org_id: number | null; expires_at: string }>();
  if (!row || row.expires_at < new Date().toISOString()) return null;
  return { token, orgId: row.org_id };
}

export async function destroySession(env: Env, req: Request, kind: SessionKind): Promise<string> {
  const token = readCookie(req, COOKIE[kind]);
  if (token) await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
  return `${COOKIE[kind]}=; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}
