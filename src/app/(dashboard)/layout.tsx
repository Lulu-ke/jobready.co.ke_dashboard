import { requireEmployer } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import DashboardShell from './dashboard-shell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const session = await requireEmployer()

    const company = await db.company.findUnique({
      where: { id: session.companyId },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        industry: true,
        size: true,
        isVerified: true,
      },
    })

    if (!company) {
      redirect('/login')
    }

    const unreadCount = await db.notification.count({
      where: { userId: session.id, isRead: false },
    })

    return (
      <DashboardShell
        user={session}
        company={company}
        unreadCount={unreadCount}
      >
        {children}
      </DashboardShell>
    )
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    if (msg.toLowerCase().includes('redirect')) {
      redirect('/login')
    }
    redirect('/login')
  }
}
