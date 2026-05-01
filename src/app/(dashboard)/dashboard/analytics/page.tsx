import { requireEmployer } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'

export default async function AnalyticsPage() {
  try {
    const session = await requireEmployer()
    const companyId = session.companyId

    const now = new Date()
    const sixMonthsAgo = subMonths(now, 5)

    const [totalJobs, activeJobs, totalApps, totalViews, jobsWithViews, monthlyApps] = await Promise.all([
      db.job.count({ where: { companyId } }),
      db.job.count({ where: { companyId, status: 'ACTIVE' } }),
      db.jobApplication.count({ where: { job: { companyId } } }),
      db.job.aggregate({ where: { companyId }, _sum: { views: true } }),
      db.job.findMany({
        where: { companyId },
        select: { title: true, views: true },
        orderBy: { views: 'desc' },
        take: 8,
      }),
      // Monthly application trend for last 6 months
      Promise.all(
        Array.from({ length: 6 }).map(async (_, i) => {
          const date = subMonths(now, 5 - i)
          const start = startOfMonth(date)
          const end = endOfMonth(date)
          const count = await db.jobApplication.count({
            where: {
              job: { companyId },
              appliedAt: { gte: start, lte: end },
            },
          })
          return { month: format(date, 'MMM yyyy'), count }
        })
      ),
    ])

    const maxViews = Math.max(...jobsWithViews.map((j) => j.views), 1)
    const maxApps = Math.max(...monthlyApps.map((m) => m.count), 1)

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Track your hiring performance</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs text-gray-500 mb-1">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">{totalJobs}</p>
              <p className="text-xs text-emerald-600 mt-1">{activeJobs} active</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs text-gray-500 mb-1">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">{totalApps}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs text-gray-500 mb-1">Total Views</p>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">{totalViews._sum.views || 0}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs text-gray-500 mb-1">Avg Views/Job</p>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">
                {totalJobs > 0 ? Math.round((totalViews._sum.views || 0) / totalJobs) : 0}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Job Views Chart */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Job Views</CardTitle>
            </CardHeader>
            <CardContent>
              {jobsWithViews.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {jobsWithViews.map((job) => (
                    <div key={job.title} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 truncate max-w-[200px]">{job.title}</span>
                        <span className="tabular-nums text-gray-500">{job.views}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-teal-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.max((job.views / maxViews) * 100, 2)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Trend */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Application Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {monthlyApps.map((m) => (
                  <div key={m.month} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{m.month}</span>
                      <span className="tabular-nums text-gray-500">{m.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.max((m.count / maxApps) * 100, m.count > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
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
