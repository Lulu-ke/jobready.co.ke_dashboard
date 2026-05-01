import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, generateToken, COOKIE_NAME } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { companyMembership: { include: { company: { select: { id: true, name: true, slug: true, logoUrl: true } } } } },
    })

    if (!user || !user.isActive) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })

    await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })

    const token = await generateToken({ userId: user.id, email: user.email, role: user.role })
    const responseData: Record<string, unknown> = {
      message: 'Login successful', user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl }, token,
    }
    if (user.role === 'EMPLOYER' && user.companyMembership.length > 0) responseData.company = user.companyMembership[0].company
    if (user.role === 'ADMIN') responseData.isAdmin = true

    const response = NextResponse.json(responseData)
    response.cookies.set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' })
    return response
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
