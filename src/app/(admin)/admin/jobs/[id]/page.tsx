'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Building2,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Users,
  Calendar,
  User,
} from 'lucide-react'
import { format } from 'date-fns'

interface JobDetail {
  id: string
  title: string
  slug: string
  description: string
  requirements: string | null
  responsibilities: string | null
  benefits: string | null
  salaryMin: number | null
  salaryMax: number | null
  salaryCurrency: string
  jobType: string
  experienceLevel: string
  category: string | null
  location: string | null
  isRemote: boolean
  deadline: string | null
  status: string
  rejectionReason: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
  updatedAt: string
  company: {
    id: string
    name: string
    slug: string
    logo: string | null
    industry: string | null
    location: string | null
    isVerified: boolean
    members: Array<{
      role: string
      user: { id: string; name: string | null; email: string }
    }>
  }
  applications: Array<{
    id: string
    status: string
    createdAt: string
    user: { name: string | null; email: string }
  }>
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  EXPIRED: 'bg-gray-100 text-gray-800',
}

export default function AdminJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [job, setJob] = useState<JobDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [rejectDialog, setRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/jobs/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setJob(data.job)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const handleApprove = async () => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/jobs/${id}/approve`, { method: 'PATCH' })
      if (!res.ok) throw new Error()
      toast({ title: 'Job approved successfully' })
      router.push('/admin/jobs')
    } catch {
      toast({ title: 'Failed to approve job', variant: 'destructive' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/jobs/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      })
      if (!res.ok) throw new Error()
      toast({ title: 'Job rejected' })
      router.push('/admin/jobs')
    } catch {
      toast({ title: 'Failed to reject job', variant: 'destructive' })
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Job not found</p>
        <Link href="/admin/jobs">
          <Button variant="link" className="mt-2">Back to jobs</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/jobs">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <Badge variant="secondary" className={statusColors[job.status] || ''}>
              {job.status}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Posted {format(new Date(job.createdAt), 'MMM d, yyyy')}
          </p>
        </div>
        {job.status === 'PENDING' && (
          <div className="flex items-center gap-2">
            <Button
              onClick={handleApprove}
              disabled={actionLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button
              variant="destructive"
              onClick={() => setRejectDialog(true)}
              disabled={actionLoading}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium">{job.jobType.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Location:</span>
                  <span className="font-medium">{job.location || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Salary:</span>
                  <span className="font-medium">
                    {job.salaryMin && job.salaryMax
                      ? `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} ${job.salaryCurrency}`
                      : 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Level:</span>
                  <span className="font-medium">{job.experienceLevel.replace(/_/g, ' ')}</span>
                </div>
                {job.deadline && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Deadline:</span>
                    <span className="font-medium">{format(new Date(job.deadline), 'MMM d, yyyy')}</span>
                  </div>
                )}
                {job.isRemote && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <Badge variant="outline" className="text-emerald-700 border-emerald-200">
                      Remote
                    </Badge>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <div className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {job.description}
                </div>
              </div>

              {job.requirements && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Requirements</h3>
                  <div className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                    {job.requirements}
                  </div>
                </div>
              )}

              {job.responsibilities && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Responsibilities</h3>
                  <div className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                    {job.responsibilities}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rejection reason (if rejected) */}
          {job.status === 'REJECTED' && job.rejectionReason && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800">Rejection Reason</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700">{job.rejectionReason}</p>
                {job.reviewedAt && (
                  <p className="text-xs text-red-500 mt-2">
                    Reviewed on {format(new Date(job.reviewedAt), 'MMM d, yyyy h:mm a')}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Applications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Applications ({job.applications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {job.applications.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {job.applications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{app.user.name || app.user.email}</p>
                          <p className="text-xs text-gray-400">{app.user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="text-xs">{app.status}</Badge>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {format(new Date(app.createdAt), 'MMM d')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No applications yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Company
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{job.company.name}</h3>
                  {job.company.isVerified && (
                    <Badge variant="outline" className="text-blue-700 border-blue-200 text-[10px]">
                      Verified
                    </Badge>
                  )}
                </div>
                {job.company.industry && (
                  <p className="text-sm text-gray-500">{job.company.industry}</p>
                )}
                {job.company.location && (
                  <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {job.company.location}
                  </p>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Team</h4>
                <div className="space-y-2">
                  {job.company.members.map((member, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                        {(member.user.name || member.user.email)[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {member.user.name || member.user.email}
                        </p>
                        <p className="text-xs text-gray-400">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Link href={`/admin/employers/${job.company.id}`}>
                <Button variant="outline" size="sm" className="w-full text-teal-700 border-teal-200 hover:bg-teal-50">
                  View Company
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Job</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting &quot;{job.title}&quot;. The employer will be notified.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || actionLoading}
            >
              Reject Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
