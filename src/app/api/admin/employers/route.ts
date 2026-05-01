import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { industry: { contains: search } },
        { location: { contains: search } },
      ]
    }

    const [companies, total] = await Promise.all([
      db.company.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          industry: true,
          location: true,
          isVerified: true,
          isSuspended: true,
          createdAt: true,
          _count: { select: { members: true, jobs: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.company.count({ where }),
    ])

    return NextResponse.json({ companies, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed'
    if (msg.toLowerCase().includes('redirect')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
