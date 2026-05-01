'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  Building2,
  MapPin,
  Globe,
  Users,
  Briefcase,
  CreditCard,
  ShieldCheck,
  Ban,
  CheckCircle2,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

interface CompanyDetail {
  id: string
  name: string
  slug: string
  logo: string | null
  website: string | null
  description: string | null
  industry: string | null
  size: string | null
  location: string | null
  isVerified: boolean
  isSuspended: boolean
  createdAt: string
  updatedAt: string
  members: Array<{
    id: string
    role: string
    joinedAt: string
    user: { id: string; name: string | null; email: string }
  }>
  jobs: Array<{
    id: string
    title: string
    status: string
    createdAt: string
  }>
  payments: Array<{
    id: string
    amount: number
    currency: string
    status: string
    createdAt: string
  }>
  _count: { jobs: number; payments: number; members: number }
}

const jobStatusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800',
  CLOSED: 'bg-gray-100 text-gray-800',
}

export default function AdminEmployerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { toast } = useToast()
  const [company, setCompany] = useState<CompanyDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/employers/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setCompany(data.company)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const handleAction = async (action: string) => {
    try {
      const res = await fetch(`/api/admin/employers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setCompany((prev) => prev ? { ...prev, ...data.company } : prev)
      toast({ title: `Company ${action}d successfully` })
    } catch {
      toast({ title: 'Action failed', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96 lg:col-span-2" />
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Company not found</p>
        <Link href="/admin/employers">
          <Button variant="link" className="mt-2">Back to employers</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/employers">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
            {company.isVerified && (
              <Badge variant="outline" className="text-blue-700 border-blue-200">
                <ShieldCheck className="w-3 h-3 mr-1" /> Verified
              </Badge>
            )}
            {company.isSuspended && (
              <Badge variant="secondary" className="bg-red-100 text-red-800">Suspended</Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Member since {format(new Date(company.createdAt), 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {company.isSuspended ? (
            <Button onClick={() => handleAction('activate')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <CheckCircle2 className="w-4 h-4 mr-2" /> Activate
            </Button>
          ) : (
            <Button variant="destructive" onClick={() => handleAction('suspend')}>
              <Ban className="w-4 h-4 mr-2" /> Suspend
            </Button>
          )}
          {!company.isVerified && (
            <Button onClick={() => handleAction('verify')} variant="outline" className="text-blue-700 border-blue-200">
              <ShieldCheck className="w-4 h-4 mr-2" /> Verify
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{company._count.members}</p>
              <p className="text-xs text-gray-500">Members</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{company._count.jobs}</p>
              <p className="text-xs text-gray-500">Jobs Posted</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{company._count.payments}</p>
              <p className="text-xs text-gray-500">Payments</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {company.description && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Description</p>
                <p className="text-sm text-gray-600">{company.description}</p>
              </div>
            )}
            <Separator />
            <div className="space-y-3">
              {company.industry && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Industry:</span>
                  <span className="font-medium">{company.industry}</span>
                </div>
              )}
              {company.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Location:</span>
                  <span className="font-medium">{company.location}</span>
                </div>
              )}
              {company.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Website:</span>
                  <span className="font-medium text-teal-700">{company.website}</span>
                </div>
              )}
              {company.size && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Size:</span>
                  <span className="font-medium">{company.size}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Jobs & Team */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            {company.jobs.length > 0 ? (
              <div className="max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Posted</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {company.jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={jobStatusColors[job.status] || ''}>
                            {job.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {format(new Date(job.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/jobs/${job.id}`}>
                            <Button variant="ghost" size="sm" className="text-teal-700">View</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">No jobs posted</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {company.members.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                  {(member.user.name || member.user.email)[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{member.user.name || 'No name'}</p>
                  <p className="text-xs text-gray-400">{member.user.email}</p>
                  <Badge variant="outline" className="text-[10px] mt-1">{member.role}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
