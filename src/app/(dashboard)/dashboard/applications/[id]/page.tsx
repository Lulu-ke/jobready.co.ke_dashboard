'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Download, Save, Mail, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Application {
  id: string
  applicantName: string
  applicantEmail: string
  applicantPhone: string | null
  coverLetter: string | null
  cvUrl: string | null
  status: string
  employerNotes: string | null
  appliedAt: string
  job: { id: string; title: string; company: { name: string } }
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  reviewing: 'bg-blue-100 text-blue-700',
  shortlisted: 'bg-emerald-100 text-emerald-700',
  hired: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function ApplicationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const appId = params.id as string
  const [app, setApp] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    async function fetchApp() {
      try {
        const res = await fetch(`/api/applications/${appId}`)
        if (res.ok) {
          const data = await res.json()
          setApp(data)
          setStatus(data.status)
          setNotes(data.employerNotes || '')
        } else {
          toast.error('Application not found')
          router.push('/dashboard/applications')
        }
      } catch {
        toast.error('Failed to load')
      }
      setLoading(false)
    }
    fetchApp()
  }, [appId, router])

  async function saveNotes() {
    setSaving(true)
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, employerNotes: notes }),
      })
      if (res.ok) {
        toast.success('Updated')
        setApp((prev) => prev ? { ...prev, status, employerNotes: notes } : null)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed')
      }
    } catch {
      toast.error('Failed')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (!app) return null

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Application</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {app.applicantName} — {app.job.title}
          </p>
        </div>
        <Badge variant="secondary" className={statusColors[app.status] || ''}>
          {app.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Applicant Info */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Applicant Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Full Name</p>
                  <p className="text-sm font-medium text-gray-900">{app.applicantName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-sm text-gray-900">{app.applicantEmail}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Phone</p>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-sm text-gray-900">{app.applicantPhone || 'Not provided'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Applied On</p>
                  <p className="text-sm text-gray-900">{format(new Date(app.appliedAt), 'MMMM d, yyyy')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cover Letter */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Cover Letter</CardTitle>
            </CardHeader>
            <CardContent>
              {app.coverLetter ? (
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                  {app.coverLetter}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No cover letter provided</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Employer Notes</Label>
                <Textarea rows={4} placeholder="Add internal notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>

              <Button className="w-full bg-teal-700 hover:bg-teal-800 text-white" onClick={saveNotes} disabled={saving}>
                <Save className="w-4 h-4 mr-2" /> Save Updates
              </Button>
            </CardContent>
          </Card>

          {/* CV Download */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Resume / CV</CardTitle>
            </CardHeader>
            <CardContent>
              {app.cvUrl ? (
                <Button variant="outline" className="w-full" asChild>
                  <a href={app.cvUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4 mr-2" /> Download CV
                  </a>
                </Button>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No CV uploaded</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
