import { NextRequest, NextResponse } from 'next/server'
import { requireEmployer } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireEmployer(req)
    const { id } = await params

    const job = await db.job.findFirst({
      where: { id, companyId: session.companyId },
      include: { _count: { select: { applications: true } } },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json(job)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed'
    if (msg.toLowerCase().includes('redirect')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireEmployer(req)
    const { id } = await params
    const body = await req.json()

    const job = await db.job.findFirst({
      where: { id, companyId: session.companyId },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const updated = await db.job.update({
      where: { id },
      data: {
        title: body.title ?? job.title,
        description: body.description ?? job.description,
        requirements: body.requirements !== undefined ? body.requirements : job.requirements,
        howToApply: body.howToApply !== undefined ? body.howToApply : job.howToApply,
        location: body.location !== undefined ? body.location : job.location,
        county: body.county !== undefined ? body.county : job.county,
        type: body.type !== undefined ? body.type : job.type,
        experience: body.experience !== undefined ? body.experience : job.experience,
        category: body.category !== undefined ? body.category : job.category,
        salaryMin: body.salaryMin ? parseInt(body.salaryMin) : null,
        salaryMax: body.salaryMax ? parseInt(body.salaryMax) : null,
        closingDate: body.closingDate ? new Date(body.closingDate) : null,
        isRemote: body.isRemote !== undefined ? body.isRemote : job.isRemote,
      },
    })

    return NextResponse.json({ job: updated })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed'
    if (msg.toLowerCase().includes('redirect')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireEmployer(req)
    const { id } = await params

    const job = await db.job.findFirst({
      where: { id, companyId: session.companyId },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    await db.jobApplication.deleteMany({ where: { jobId: id } })
    await db.job.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed'
    if (msg.toLowerCase().includes('redirect')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
