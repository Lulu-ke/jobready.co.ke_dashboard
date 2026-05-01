import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    let company = null
    if (user.role === 'EMPLOYER') {
      const membership = await db.companyMember.findFirst({
        where: { userId: user.id },
        include: { company: { select: { id: true, name: true, slug: true, logoUrl: true } } },
      })
      if (membership) company = membership.company
    }

    return NextResponse.json({ user, company })
  } catch {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
}

import { db } from '@/lib/db'
