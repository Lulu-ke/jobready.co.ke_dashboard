import { NextRequest } from 'next/server';
import { requireAdmin as authRequireAdmin, type SessionUser } from '@/lib/auth';

export { type SessionUser };

export async function requireAdmin(req?: NextRequest): Promise<SessionUser> {
  return authRequireAdmin(req);
}

export function getAdminUserId(session: SessionUser): string {
  return session.id;
}

export function getClientIp(req?: NextRequest): string {
  if (!req) return 'unknown';
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}
