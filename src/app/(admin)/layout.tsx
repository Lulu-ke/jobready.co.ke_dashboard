import { requireAdmin } from '@/lib/admin'
import AdminShell from './admin-shell'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Admin Panel — JobReady.co.ke',
  description: 'JobReady Kenya Admin Panel',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    await requireAdmin()
  } catch {
    redirect('/')
  }

  return <AdminShell>{children}</AdminShell>
}
