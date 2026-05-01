import { NextRequest, NextResponse } from 'next/server'
import { requireEmployer } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireEmployer(req)
    const { id } = await params
    const body = await req.json()
    const { status } = body

    const job = await db.job.findFirst({
      where: { id, companyId: session.companyId },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const allowedTransitions: Record<string, string[]> = {
      'DRAFT': ['PENDING_REVIEW', 'CLOSED'],
      'PENDING_REVIEW': ['APPROVED', 'REJECTED', 'CLOSED'],
      'APPROVED': ['ACTIVE', 'CLOSED'],
      'ACTIVE': ['CLOSED'],
      'REJECTED': ['PENDING_REVIEW', 'DRAFT'],
    }

    const allowed = allowedTransitions[job.status]
    if (!allowed || !allowed.includes(status)) {
      return NextResponse.json({ error: `Cannot transition from ${job.status} to ${status}` }, { status: 400 })
    }

    const updated = await db.job.update({
      where: { id },
      data: {
        status,
        postedAt: status === 'ACTIVE' ? new Date() : job.postedAt,
        rejectionReason: status === 'REJECTED' ? body.rejectionReason : null,
      },
    })

    return NextResponse.json({ job: updated })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed'
    if (msg.toLowerCase().includes('redirect')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
