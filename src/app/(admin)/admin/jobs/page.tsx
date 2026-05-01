'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Search, Eye, CheckCircle2, XCircle, MoreHorizontal } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

interface Job {
  id: string
  title: string
  status: string
  location: string | null
  jobType: string
  createdAt: string
  company: {
    id: string
    name: string
    logo: string | null
    isVerified: boolean
  }
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  EXPIRED: 'bg-gray-100 text-gray-800',
}

export default function AdminJobsPage() {
  const { toast } = useToast()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('PENDING')
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeTab !== 'ALL') params.set('status', activeTab)
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/jobs?${params}`)
      const data = await res.json()
      setJobs(data.jobs || [])
    } catch {
      toast({ title: 'Failed to load jobs', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [activeTab, search, toast])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const handleApprove = async (id: string) => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/jobs/${id}/approve`, { method: 'PATCH' })
      if (!res.ok) throw new Error()
      toast({ title: 'Job approved successfully' })
      fetchJobs()
    } catch {
      toast({ title: 'Failed to approve job', variant: 'destructive' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    if (!rejectId || !rejectReason.trim()) return
    setActionLoading(rejectId)
    try {
      const res = await fetch(`/api/admin/jobs/${rejectId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      })
      if (!res.ok) throw new Error()
      toast({ title: 'Job rejected' })
      setRejectId(null)
      setRejectReason('')
      fetchJobs()
    } catch {
      toast({ title: 'Failed to reject job', variant: 'destructive' })
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Job Moderation</h1>
        <p className="text-gray-500 mt-1">Review and manage job listings</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="ALL">All</TabsTrigger>
          <TabsTrigger value="ACTIVE">Active</TabsTrigger>
          <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : jobs.length > 0 ? (
                <div className="max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-6">Job Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="px-6 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow key={job.id} className="hover:bg-gray-50">
                          <TableCell className="px-6">
                            <div className="flex items-center gap-2">
                              <Link href={`/admin/jobs/${job.id}`} className="font-medium text-gray-900 hover:text-teal-700 transition-colors">
                                {job.title}
                              </Link>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                                {job.jobType.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm text-gray-600">{job.company.name}</span>
                              {job.company.isVerified && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">{job.location || '—'}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={statusColors[job.status] || ''}>
                              {job.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {format(new Date(job.createdAt), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/admin/jobs/${job.id}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                              {job.status === 'PENDING' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprove(job.id)}
                                    disabled={actionLoading === job.id}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white h-8"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setRejectId(job.id)}
                                    disabled={actionLoading === job.id}
                                    className="h-8"
                                  >
                                    <XCircle className="w-3.5 h-3.5 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12 text-center text-gray-400">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No jobs found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={!!rejectId} onOpenChange={() => { setRejectId(null); setRejectReason('') }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Job</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this job. The employer will be notified.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectId(null); setRejectReason('') }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || !!actionLoading}
            >
              Reject Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
