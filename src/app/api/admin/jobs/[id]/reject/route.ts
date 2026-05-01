import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, getClientIp } from '@/lib/admin'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin(req)
    const { id } = await params
    const body = await req.json()
    const { reason } = body

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 })
    }

    const job = await db.job.findUnique({ where: { id } })
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const updatedJob = await db.job.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason.trim(),
        reviewedBy: session.id,
        reviewedAt: new Date(),
      },
    })

    // Notify company owner
    const owner = await db.companyMember.findFirst({
      where: { companyId: job.companyId, role: 'OWNER' },
    })
    if (owner) {
      await db.notification.create({
        data: {
          userId: owner.userId,
          type: 'JOB_REJECTED',
          title: 'Job Rejected',
          message: `Your job "${job.title}" has been rejected. Reason: ${reason.trim()}`,
          link: '/dashboard/jobs',
        },
      })
    }

    // Audit log
    await db.adminAuditLog.create({
      data: {
        userId: session.id,
        action: 'JOB_REJECTED',
        target: job.id,
        details: JSON.stringify({ title: job.title, reason: reason.trim() }),
        ip: getClientIp(req),
        createdAt: new Date(),
      },
    })

    return NextResponse.json({ job: updatedJob })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed'
    if (msg.toLowerCase().includes('redirect')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
