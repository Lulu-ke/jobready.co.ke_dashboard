import { NextRequest, NextResponse } from 'next/server'
import { requireEmployer } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireEmployer(req)
    const { id } = await params

    const application = await db.jobApplication.findFirst({
      where: {
        id,
        job: { companyId: session.companyId },
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: { select: { name: true } },
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    return NextResponse.json(application)
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
    const { status, employerNotes } = body

    const application = await db.jobApplication.findFirst({
      where: {
        id,
        job: { companyId: session.companyId },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const updated = await db.jobApplication.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(employerNotes !== undefined ? { employerNotes } : {}),
      },
    })

    return NextResponse.json({ application: updated })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed'
    if (msg.toLowerCase().includes('redirect')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
