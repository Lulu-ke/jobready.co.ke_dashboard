import { NextRequest, NextResponse } from 'next/server'
import { requireEmployer } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PUT(req: NextRequest) {
  try {
    const session = await requireEmployer(req)
    const body = await req.json()
    const { name, email, phone } = body

    const updated = await db.user.update({
      where: { id: session.id },
      data: {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
        ...(phone !== undefined ? { phone } : {}),
      },
    })

    return NextResponse.json({ user: updated })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed'
    if (msg.toLowerCase().includes('redirect')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
