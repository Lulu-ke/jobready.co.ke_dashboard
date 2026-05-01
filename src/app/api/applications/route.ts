import { NextRequest, NextResponse } from 'next/server'
import { requireEmployer } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await requireEmployer(req)
    const { searchParams } = new URL(req.url)
    const jobId = searchParams.get('jobId')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {
      job: { companyId: session.companyId },
    }

    if (jobId) {
      where.jobId = jobId
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { applicantName: { contains: search } },
        { applicantEmail: { contains: search } },
      ]
    }

    const applications = await db.jobApplication.findMany({
      where,
      orderBy: { appliedAt: 'desc' },
      include: {
        job: { select: { id: true, title: true } },
      },
      take: 100,
    })

    return NextResponse.json({ applications })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed'
    if (msg.toLowerCase().includes('redirect')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
