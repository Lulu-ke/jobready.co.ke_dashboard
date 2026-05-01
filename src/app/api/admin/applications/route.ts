import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const jobId = searchParams.get('jobId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (jobId) where.jobId = jobId

    const [applications, total] = await Promise.all([
      db.jobApplication.findMany({
        where,
        include: {
          job: { select: { id: true, title: true, status: true } },
          company: true,
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.jobApplication.count({ where }),
    ])

    return NextResponse.json({ applications, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed'
    if (msg.toLowerCase().includes('redirect')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
