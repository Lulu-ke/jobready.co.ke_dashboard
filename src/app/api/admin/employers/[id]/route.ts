import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, getClientIp } from '@/lib/admin'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(req)
    const { id } = await params

    const company = await db.company.findUnique({
      where: { id },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, role: true } } },
        },
        jobs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { jobs: true, payments: true, members: true },
        },
      },
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    return NextResponse.json({ company })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed'
    if (msg.toLowerCase().includes('redirect')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin(req)
    const { id } = await params
    const body = await req.json()
    const { action } = body

    const company = await db.company.findUnique({ where: { id } })
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    let auditAction = ''

    switch (action) {
      case 'suspend':
        updateData.isSuspended = true
        auditAction = 'EMPLOYER_SUSPENDED'
        break
      case 'activate':
        updateData.isSuspended = false
        auditAction = 'EMPLOYER_ACTIVATED'
        break
      case 'verify':
        updateData.isVerified = true
        auditAction = 'EMPLOYER_VERIFIED'
        break
      case 'unverify':
        updateData.isVerified = false
        auditAction = 'EMPLOYER_UNVERIFIED'
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const updated = await db.company.update({
      where: { id },
      data: updateData,
    })

    await db.adminAuditLog.create({
      data: {
        userId: session.id,
        action: auditAction,
        target: company.id,
        details: JSON.stringify({ companyName: company.name, action }),
        ip: getClientIp(req),
        createdAt: new Date(),
      },
    })

    return NextResponse.json({ company: updated })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed'
    if (msg.toLowerCase().includes('redirect')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin(req)
    const { id } = await params

    const company = await db.company.findUnique({ where: { id } })
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    await db.company.delete({ where: { id } })

    await db.adminAuditLog.create({
      data: {
        userId: session.id,
        action: 'EMPLOYER_DELETED',
        target: company.id,
        details: JSON.stringify({ companyName: company.name }),
        ip: getClientIp(req),
        createdAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed'
    if (msg.toLowerCase().includes('redirect')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
