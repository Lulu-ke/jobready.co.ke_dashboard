import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, generateToken, COOKIE_NAME } from '@/lib/auth'
import { generateSlug } from '@/lib/slug'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, companyName, companyEmail } = await request.json()
    if (!name || !email || !password || !companyName || !companyEmail)
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    if (password.length < 8)
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

    const existingUser = await db.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existingUser) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

    const existingCompany = await db.company.findUnique({ where: { email: companyEmail.toLowerCase() } })
    if (existingCompany) return NextResponse.json({ error: 'Company email already registered' }, { status: 409 })

    const hashed = await hashPassword(password)
    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.create({ data: { name, email: email.toLowerCase(), password: hashed, role: 'EMPLOYER' } })
      let slug = generateSlug(companyName)
      let counter = 1
      while (await tx.company.findUnique({ where: { slug } })) { slug = `${generateSlug(companyName)}-${counter++}` }
      const company = await tx.company.create({ data: { name: companyName, slug, email: companyEmail.toLowerCase() } })
      await tx.companyMember.create({ data: { userId: user.id, companyId: company.id, role: 'OWNER' } })
      return { user, company }
    })

    const token = await generateToken({ userId: result.user.id, email: result.user.email, role: result.user.role })
    const response = NextResponse.json({ message: 'Registration successful', user: { id: result.user.id, name: result.user.name, email: result.user.email, role: result.user.role }, company: { id: result.company.id, name: result.company.name, slug: result.company.slug }, token })
    response.cookies.set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' })
    return response
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
