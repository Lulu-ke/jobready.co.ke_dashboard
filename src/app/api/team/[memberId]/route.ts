import { NextRequest, NextResponse } from 'next/server'
import { requireEmployer } from '@/lib/auth'
import { db } from '@/lib/db'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ memberId: string }> }) {
  try {
    const session = await requireEmployer(req)
    const { memberId } = await params

    const member = await db.companyMember.findFirst({
      where: { id: memberId, companyId: session.companyId },
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    if (member.role === 'OWNER') {
      return NextResponse.json({ error: 'Cannot remove owner' }, { status: 400 })
    }

    // Check if current user is owner or admin
    if (session.memberRole !== 'OWNER' && session.memberRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    await db.companyMember.delete({ where: { id: memberId } })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed'
    if (msg.toLowerCase().includes('redirect')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
