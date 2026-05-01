import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'jobready-dashboard-secret-key-change-in-production'
)

export const COOKIE_NAME = 'jr-auth-token'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function generateToken(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as Record<string, unknown>
  } catch {
    return null
  }
}

export interface SessionUser {
  id: string
  name: string
  email: string
  role: string
  phone?: string | null
  avatarUrl?: string | null
}

export interface EmployerSession extends SessionUser {
  companyId: string
  companyName: string
  memberRole: string
}

export async function getSession(req?: NextRequest): Promise<SessionUser | null> {
  try {
    let token: string | undefined
    if (req) {
      token = req.cookies.get(COOKIE_NAME)?.value
    } else {
      const cookieStore = await cookies()
      token = cookieStore.get(COOKIE_NAME)?.value
    }
    if (!token) return null

    const payload = await verifyToken(token)
    if (!payload) return null

    const user = await db.user.findUnique({
      where: { id: payload.userId as string },
      select: { id: true, name: true, email: true, role: true, phone: true, avatarUrl: true, isActive: true },
    })
    if (!user || !user.isActive) return null
    return user
  } catch {
    return null
  }
}

export async function requireAuth(req?: NextRequest): Promise<SessionUser> {
  const user = await getSession(req)
  if (!user) redirect('/')
  return user
}

export async function requireEmployer(req?: NextRequest): Promise<EmployerSession> {
  const user = await getSession(req)
  if (!user) redirect('/')
  if (user.role !== 'EMPLOYER' && user.role !== 'ADMIN') redirect('/')

  const membership = await db.companyMember.findFirst({
    where: { userId: user.id },
    include: { company: { select: { id: true, name: true, isActive: true } } },
  })
  if (!membership || !membership.company.isActive) redirect('/')

  return { ...user, companyId: membership.companyId, companyName: membership.company.name, memberRole: membership.role }
}

export async function requireAdmin(req?: NextRequest): Promise<SessionUser> {
  const user = await getSession(req)
  if (!user) redirect('/')
  if (user.role !== 'ADMIN') redirect('/')
  return user
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' })
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 0, path: '/' })
}
