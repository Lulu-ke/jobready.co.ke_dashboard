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

    const job = await db.job.findUnique({ where: { id } })
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const updatedJob = await db.job.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        reviewedBy: session.id,
        reviewedAt: new Date(),
      },
      include: { company: true },
    })

    // Notify company owner
    const owner = await db.companyMember.findFirst({
      where: { companyId: job.companyId, role: 'OWNER' },
    })
    if (owner) {
      await db.notification.create({
        data: {
          userId: owner.userId,
          type: 'JOB_APPROVED',
          title: 'Job Approved',
          message: `Your job "${job.title}" has been approved and is now live!`,
          link: '/dashboard/jobs',
        },
      })
    }

    // Audit log
    await db.adminAuditLog.create({
      data: {
        userId: session.id,
        action: 'JOB_APPROVED',
        target: job.id,
        details: JSON.stringify({ title: job.title, companyId: job.companyId }),
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
