import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)

    const [payments, sponsoredAds, revenueSummary] = await Promise.all([
      db.payment.findMany({
        include: {
          company: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      db.sponsoredAd.findMany({
        include: {
          company: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      db.payment.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
        _count: true,
      }),
    ])

    const pendingPayments = await db.payment.aggregate({
      where: { status: 'PENDING' },
      _sum: { amount: true },
      _count: true,
    })

    return NextResponse.json({
      payments,
      sponsoredAds,
      revenueSummary: {
        total: revenueSummary._sum.amount || 0,
        count: revenueSummary._count,
      },
      pendingPayments: {
        total: pendingPayments._sum.amount || 0,
        count: pendingPayments._count,
      },
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed'
    if (msg.toLowerCase().includes('redirect')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
