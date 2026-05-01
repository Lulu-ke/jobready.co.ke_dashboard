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
    const body = await req.json()
    const { action } = body

    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    let auditAction = ''

    switch (action) {
      case 'suspend':
        updateData.isSuspended = true
        auditAction = 'USER_SUSPENDED'
        break
      case 'activate':
        updateData.isSuspended = false
        auditAction = 'USER_ACTIVATED'
        break
      case 'setRole':
        if (!body.role) {
          return NextResponse.json({ error: 'Role is required' }, { status: 400 })
        }
        updateData.role = body.role
        auditAction = 'USER_ROLE_CHANGED'
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const updated = await db.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, isSuspended: true },
    })

    await db.adminAuditLog.create({
      data: {
        userId: session.id,
        action: auditAction,
        target: user.id,
        details: JSON.stringify({ userName: user.name || user.email, action, role: body.role }),
        ip: getClientIp(req),
        createdAt: new Date(),
      },
    })

    return NextResponse.json({ user: updated })
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

    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await db.user.delete({ where: { id } })

    await db.adminAuditLog.create({
      data: {
        userId: session.id,
        action: 'USER_DELETED',
        target: user.id,
        details: JSON.stringify({ userName: user.name || user.email }),
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
