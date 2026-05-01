import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()
    if (!token || !newPassword) return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 })
    if (newPassword.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

    const user = await db.user.findFirst({ where: { resetToken: token, resetTokenExpiry: { gt: new Date() } } })
    if (!user) return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 })

    const hashed = await hashPassword(newPassword)
    await db.user.update({ where: { id: user.id }, data: { password: hashed, resetToken: null, resetTokenExpiry: null } })
    return NextResponse.json({ message: 'Password reset successfully' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
