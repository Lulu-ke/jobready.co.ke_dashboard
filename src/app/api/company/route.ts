import { NextRequest, NextResponse } from 'next/server'
import { requireEmployer } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await requireEmployer(req)

    const company = await db.company.findUnique({
      where: { id: session.companyId },
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    return NextResponse.json(company)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed'
    if (msg.toLowerCase().includes('redirect')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireEmployer(req)
    const body = await req.json()

    const company = await db.company.findUnique({
      where: { id: session.companyId },
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const updated = await db.company.update({
      where: { id: session.companyId },
      data: {
        name: body.name ?? company.name,
        email: body.email !== undefined ? body.email : company.email,
        phone: body.phone !== undefined ? body.phone : company.phone,
        website: body.website !== undefined ? body.website : company.website,
        description: body.description !== undefined ? body.description : company.description,
        industry: body.industry !== undefined ? body.industry : company.industry,
        size: body.size !== undefined ? body.size : company.size,
        orgType: body.orgType !== undefined ? body.orgType : company.orgType,
        county: body.county !== undefined ? body.county : company.county,
        address: body.address !== undefined ? body.address : company.address,
      },
    })

    return NextResponse.json({ company: updated })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed'
    if (msg.toLowerCase().includes('redirect')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
