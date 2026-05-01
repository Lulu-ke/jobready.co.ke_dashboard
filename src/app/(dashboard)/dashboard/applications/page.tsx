'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search } from 'lucide-react'
import { format } from 'date-fns'

interface Application {
  id: string
  applicantName: string
  applicantEmail: string
  applicantPhone: string | null
  status: string
  appliedAt: string
  job: { id: string; title: string }
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  reviewing: 'bg-blue-100 text-blue-700',
  shortlisted: 'bg-emerald-100 text-emerald-700',
  hired: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function ApplicationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [jobFilter, setJobFilter] = useState(searchParams.get('jobId') || 'all')
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([])
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    async function fetchJobs() {
      const res = await fetch('/api/jobs?limit=100')
      if (res.ok) {
        const data = await res.json()
        setJobs(data.jobs || [])
      }
    }
    fetchJobs()
  }, [])

  useEffect(() => {
    async function fetchApps() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (debouncedSearch) params.set('search', debouncedSearch)
        if (statusFilter !== 'all') params.set('status', statusFilter)
        if (jobFilter !== 'all') params.set('jobId', jobFilter)
        const res = await fetch(`/api/applications?${params}`)
        if (res.ok) {
          const data = await res.json()
          setApplications(data.applications || [])
        }
      } catch {}
      setLoading(false)
    }
    fetchApps()
  }, [debouncedSearch, statusFilter, jobFilter])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-500 text-sm mt-1">Review and manage job applications</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="shortlisted">Shortlisted</SelectItem>
            <SelectItem value="hired">Hired</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={jobFilter} onValueChange={setJobFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Jobs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            {jobs.map((j) => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Applicant</TableHead>
                  <TableHead className="font-semibold">Job</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Applied</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-12 text-gray-400">Loading...</TableCell></TableRow>
                ) : applications.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-12 text-gray-400">No applications found</TableCell></TableRow>
                ) : (
                  applications.map((app) => (
                    <TableRow key={app.id} className="cursor-pointer" onClick={() => router.push(`/dashboard/applications/${app.id}`)}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{app.applicantName}</p>
                          <p className="text-xs text-gray-500">{app.applicantEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{app.job.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusColors[app.status] || ''}>
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-400">
                        {format(new Date(app.appliedAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-teal-700">
                          View →
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
