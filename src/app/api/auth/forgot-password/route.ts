import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } })
    if (!user) return NextResponse.json({ message: 'If an account exists, a reset link has been sent' })

    const token = randomBytes(32).toString('hex')
    await db.user.update({ where: { id: user.id }, data: { resetToken: token, resetTokenExpiry: new Date(Date.now() + 3600000) } })
    return NextResponse.json({ message: 'Reset token generated', token }) // token in response for dev
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
