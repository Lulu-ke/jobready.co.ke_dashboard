'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Building2,
  Briefcase,
  FileText,
  DollarSign,
  Clock,
  ArrowRight,
  Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

interface Stats {
  totalEmployers: number
  activeJobs: number
  totalApplications: number
  totalRevenue: number
  pendingJobs: number
  jobsByStatus: Record<string, number>
  recentActivity: Array<{
    id: string
    action: string
    target: string | null
    details: string | null
    createdAt: string
    user: { name: string | null; email: string }
  }>
  pendingReviewJobs: Array<{
    id: string
    title: string
    status: string
    createdAt: string
    company: { name: string }
  }>
}

const statCards = [
  { key: 'totalEmployers' as const, label: 'Total Employers', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'activeJobs' as const, label: 'Active Jobs', icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { key: 'totalApplications' as const, label: 'Total Applications', icon: FileText, color: 'text-violet-600', bg: 'bg-violet-50' },
  { key: 'totalRevenue' as const, label: 'Revenue (KES)', icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
]

const actionColors: Record<string, string> = {
  JOB_APPROVED: 'bg-emerald-100 text-emerald-800',
  JOB_REJECTED: 'bg-red-100 text-red-800',
  EMPLOYER_SUSPENDED: 'bg-red-100 text-red-800',
  EMPLOYER_ACTIVATED: 'bg-emerald-100 text-emerald-800',
  EMPLOYER_VERIFIED: 'bg-blue-100 text-blue-800',
  USER_SUSPENDED: 'bg-red-100 text-red-800',
  USER_ACTIVATED: 'bg-emerald-100 text-emerald-800',
  USER_DELETED: 'bg-gray-100 text-gray-800',
  EMPLOYER_DELETED: 'bg-gray-100 text-gray-800',
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of the JobReady platform</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          : statCards.map((card) => (
              <Card key={card.key} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{card.label}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {card.key === 'totalRevenue'
                          ? `${(stats![card.key] || 0).toLocaleString()}`
                          : (stats![card.key] || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                      <card.icon className={`w-6 h-6 ${card.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Review Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-base">Pending Review</CardTitle>
                <CardDescription>Jobs awaiting admin approval</CardDescription>
              </div>
            </div>
            <Link href="/admin/jobs?status=PENDING">
              <Button variant="ghost" size="sm" className="gap-1 text-teal-700">
                View All <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="px-0">
            {loading ? (
              <div className="px-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : stats?.pendingReviewJobs && stats.pendingReviewJobs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">Job Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="px-6 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.pendingReviewJobs.slice(0, 5).map((job) => (
                    <TableRow key={job.id} className="hover:bg-gray-50">
                      <TableCell className="px-6 font-medium text-gray-900">{job.title}</TableCell>
                      <TableCell className="text-gray-500">{job.company.name}</TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {format(new Date(job.createdAt), 'MMM d')}
                      </TableCell>
                      <TableCell className="px-6 text-right">
                        <Link href={`/admin/jobs/${job.id}`}>
                          <Button variant="outline" size="sm" className="text-teal-700 border-teal-200 hover:bg-teal-50">
                            Review
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="px-6 py-8 text-center text-gray-400">
                <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No pending jobs</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
                <Activity className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <CardTitle className="text-base">Recent Activity</CardTitle>
                <CardDescription>Latest admin actions</CardDescription>
              </div>
            </div>
            <Link href="/admin/audit">
              <Button variant="ghost" size="sm" className="gap-1 text-teal-700">
                View All <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {stats.recentActivity.slice(0, 8).map((log) => (
                  <div key={log.id} className="flex items-start gap-3 py-2">
                    <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {log.user.name || log.user.email}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] px-1.5 py-0 ${actionColors[log.action] || 'bg-gray-100 text-gray-800'}`}
                        >
                          {log.action.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {format(new Date(log.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
