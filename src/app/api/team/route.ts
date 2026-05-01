import { NextRequest, NextResponse } from 'next/server'
import { requireEmployer } from '@/lib/auth'
import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function GET(req: NextRequest) {
  try {
    const session = await requireEmployer(req)

    const [members, invitations] = await Promise.all([
      db.companyMember.findMany({
        where: { companyId: session.companyId },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { joinedAt: 'asc' },
      }),
      db.companyInvitation.findMany({
        where: { companyId: session.companyId },
        include: {
          invitedByUser: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    return NextResponse.json({ members, invitations })
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
    const { email, role } = body

    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if already a member
    const existingUser = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } })
    if (existingUser) {
      const existingMember = await db.companyMember.findFirst({
        where: { userId: existingUser.id, companyId: session.companyId },
      })
      if (existingMember) {
        return NextResponse.json({ error: 'User is already a team member' }, { status: 400 })
      }
    }

    // Check existing invitation
    const existingInvitation = await db.companyInvitation.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        companyId: session.companyId,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    })
    if (existingInvitation) {
      return NextResponse.json({ error: 'Invitation already sent' }, { status: 400 })
    }

    const token = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const invitation = await db.companyInvitation.create({
      data: {
        email: email.trim().toLowerCase(),
        companyId: session.companyId,
        role: role || 'VIEWER',
        token,
        invitedBy: session.id,
        expiresAt,
      },
    })

    // TODO: Send invitation email
    return NextResponse.json({ invitation }, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed'
    if (msg.toLowerCase().includes('redirect')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
