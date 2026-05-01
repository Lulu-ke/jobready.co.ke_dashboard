import { requireEmployer } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Briefcase, FileText, Eye, Clock, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    ACTIVE: 'bg-emerald-100 text-emerald-700',
    DRAFT: 'bg-blue-100 text-blue-700',
    PENDING_REVIEW: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700',
    CLOSED: 'bg-gray-100 text-gray-600',
    EXPIRED: 'bg-gray-100 text-gray-600',
    pending: 'bg-yellow-100 text-yellow-700',
    reviewing: 'bg-blue-100 text-blue-700',
    shortlisted: 'bg-emerald-100 text-emerald-700',
    hired: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
  }
  return (
    <Badge variant="secondary" className={variants[status] || 'bg-gray-100 text-gray-600'}>
      {status.replace(/_/g, ' ')}
    </Badge>
  )
}

export default async function OverviewPage() {
  try {
    const session = await requireEmployer()
    const companyId = session.companyId

    const [activeJobs, appsThisMonth, totalViews, pendingReviews, recentApps] = await Promise.all([
      db.job.count({ where: { companyId, status: 'ACTIVE' } }),
      db.jobApplication.count({
        where: {
          job: { companyId },
          appliedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
      db.job.aggregate({ where: { companyId }, _sum: { views: true } }),
      db.job.count({ where: { companyId, status: 'PENDING_REVIEW' } }),
      db.jobApplication.findMany({
        where: { job: { companyId } },
        include: { job: { select: { title: true } } },
        orderBy: { appliedAt: 'desc' },
        take: 5,
      }),
    ])

    const stats = [
      { label: 'Active Jobs', value: activeJobs, icon: Briefcase, color: 'text-teal-600', bg: 'bg-teal-50' },
      { label: 'Applications This Month', value: appsThisMonth, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Total Views', value: totalViews._sum.views || 0, icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50' },
      { label: 'Pending Reviews', value: pendingReviews, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    ]

    return (
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {session.name}</h1>
          <p className="text-gray-500 mt-1">Here&apos;s an overview of your hiring activity.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`${stat.bg} p-2.5 rounded-lg`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 tabular-nums">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Applications */}
          <Card className="lg:col-span-2 border-0 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Applications</CardTitle>
              <Link href="/dashboard/applications">
                <Button variant="ghost" size="sm" className="text-teal-700">
                  View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentApps.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">No applications yet</p>
              ) : (
                <div className="space-y-3">
                  {recentApps.map((app) => (
                    <div key={app.id} className="flex items-center justify-between py-2.5 border-b last:border-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{app.applicantName}</p>
                        <p className="text-xs text-gray-500 truncate">{app.job.title} · {app.applicantEmail}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <StatusBadge status={app.status} />
                        <span className="text-xs text-gray-400 hidden sm:block">
                          {format(new Date(app.appliedAt), 'MMM d')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/jobs/new" className="block">
                <Button className="w-full justify-start gap-3 bg-teal-700 hover:bg-teal-800 text-white">
                  <Plus className="w-4 h-4" />
                  Post a New Job
                </Button>
              </Link>
              <Link href="/dashboard/jobs" className="block">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  Manage Jobs
                </Button>
              </Link>
              <Link href="/dashboard/applications" className="block">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <FileText className="w-4 h-4 text-gray-500" />
                  Review Applications
                </Button>
              </Link>
              <Link href="/dashboard/team" className="block">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  Manage Team
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed'
    if (msg.toLowerCase().includes('redirect')) redirect('/login')
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">{msg}</p>
      </div>
    )
  }
}
