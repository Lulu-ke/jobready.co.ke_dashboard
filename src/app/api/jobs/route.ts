import { NextRequest, NextResponse } from 'next/server'
import { requireEmployer } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await requireEmployer(req)
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Record<string, unknown> = { companyId: session.companyId }

    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const jobs = await db.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        _count: { select: { applications: true } },
      },
    })

    return NextResponse.json({ jobs })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed'
    if (msg.toLowerCase().includes('redirect')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireEmployer(req)
    const body = await req.json()

    const { title, description, requirements, howToApply, location, county, type, experience, category, salaryMin, salaryMax, closingDate, isRemote, status } = body

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now().toString(36)

    const job = await db.job.create({
      data: {
        title: title.trim(),
        slug,
        description: description.trim(),
        requirements: requirements || null,
        howToApply: howToApply || null,
        location: location || null,
        county: county || null,
        type: type || null,
        experience: experience || null,
        category: category || null,
        salaryMin: salaryMin ? parseInt(salaryMin) : null,
        salaryMax: salaryMax ? parseInt(salaryMax) : null,
        closingDate: closingDate ? new Date(closingDate) : null,
        isRemote: !!isRemote,
        status: status || 'DRAFT',
        postedAt: status === 'PENDING_REVIEW' ? new Date() : null,
        companyId: session.companyId,
      },
    })

    return NextResponse.json({ job }, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed'
    if (msg.toLowerCase().includes('redirect')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
