import { createHmac, timingSafeEqual } from 'node:crypto';

const SESSION_COOKIE_NAME = 'gmhost_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12h

const getAuthPassword = () => (import.meta.env.AUTH_PASSWORD as string | undefined)?.trim();
const getAuthSecret = () => (import.meta.env.AUTH_SECRET as string | undefined)?.trim();

const base64UrlEncode = (value: string) => Buffer.from(value, 'utf-8').toString('base64url');
const base64UrlDecode = (value: string) => Buffer.from(value, 'base64url').toString('utf-8');

const sign = (payload: string, secret: string) =>
  createHmac('sha256', secret).update(payload).digest('base64url');

const safeEqual = (a: string, b: string) => {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return timingSafeEqual(aBuffer, bBuffer);
};

export const isAuthConfigured = () => Boolean(getAuthPassword() && getAuthSecret());

export const isPasswordValid = (password: string) => {
  const authPassword = getAuthPassword();
  if (!authPassword) return false;
  return safeEqual(password, authPassword);
};

export const createSessionToken = () => {
  const secret = getAuthSecret();
  if (!secret) return null;

  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = String(expiresAt);
  const signature = sign(payload, secret);
  return `${base64UrlEncode(payload)}.${signature}`;
};

export const isSessionTokenValid = (token: string | undefined | null) => {
  const secret = getAuthSecret();
  if (!secret || !token) return false;

  const [encodedPayload, providedSignature] = token.split('.');
  if (!encodedPayload || !providedSignature) return false;

  let payload: string;
  try {
    payload = base64UrlDecode(encodedPayload);
  } catch {
    return false;
  }

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt)) return false;

  const expectedSignature = sign(payload, secret);
  if (!safeEqual(providedSignature, expectedSignature)) return false;

  const now = Math.floor(Date.now() / 1000);
  return expiresAt > now;
};

export const getSessionCookieName = () => SESSION_COOKIE_NAME;
