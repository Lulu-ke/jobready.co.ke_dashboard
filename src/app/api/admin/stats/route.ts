import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, getClientIp } from '@/lib/admin'

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin(req)

    const [
      totalEmployers,
      activeJobs,
      totalApplications,
      totalRevenue,
      pendingJobs,
      jobsByStatus,
      recentActivity,
      pendingReviewJobs,
    ] = await Promise.all([
      db.company.count(),
      db.job.count({ where: { status: 'ACTIVE' } }),
      db.jobApplication.count(),
      db.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
      db.job.count({ where: { status: 'PENDING' } }),
      db.job.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      db.adminAuditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
      db.job.findMany({
        where: { status: 'PENDING' },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          company: { select: { name: true } },
        },
      }),
    ])

    return NextResponse.json({
      totalEmployers,
      activeJobs,
      totalApplications,
      totalRevenue: totalRevenue._sum.amount || 0,
      pendingJobs,
      jobsByStatus: jobsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status
        return acc
      }, {} as Record<string, number>),
      recentActivity,
      pendingReviewJobs,
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed'
    if (msg.toLowerCase().includes('redirect')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
