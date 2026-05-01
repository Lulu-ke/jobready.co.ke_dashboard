'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Save, Send, Trash2 } from 'lucide-react'
import { KENYAN_COUNTIES, JOB_CATEGORIES, JOB_TYPES, EXPERIENCE_LEVELS } from '@/lib/constants'
import { toast } from 'sonner'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

export default function EditJobPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    requirements: '',
    howToApply: '',
    location: '',
    county: '',
    type: '',
    experience: '',
    category: '',
    salaryMin: '',
    salaryMax: '',
    closingDate: '',
    isRemote: false,
    status: 'DRAFT',
  })

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`/api/jobs/${jobId}`)
        if (res.ok) {
          const job = await res.json()
          setForm({
            title: job.title || '',
            description: job.description || '',
            requirements: job.requirements || '',
            howToApply: job.howToApply || '',
            location: job.location || '',
            county: job.county || '',
            type: job.type || '',
            experience: job.experience || '',
            category: job.category || '',
            salaryMin: job.salaryMin?.toString() || '',
            salaryMax: job.salaryMax?.toString() || '',
            closingDate: job.closingDate ? job.closingDate.split('T')[0] : '',
            isRemote: job.isRemote || false,
            status: job.status,
          })
        } else {
          toast.error('Job not found')
          router.push('/dashboard/jobs')
        }
      } catch {
        toast.error('Failed to load job')
      }
      setLoading(false)
    }
    fetchJob()
  }, [jobId, router])

  const update = (key: string, value: string | boolean) => setForm((p) => ({ ...p, [key]: value }))

  async function save() {
    setSaving(true)
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success('Job updated')
        router.push('/dashboard/jobs')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update')
      }
    } catch {
      toast.error('Failed to update')
    }
    setSaving(false)
  }

  async function submitForReview() {
    setSaving(true)
    try {
      const res = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PENDING_REVIEW' }),
      })
      if (res.ok) {
        toast.success('Job submitted for review')
        router.push('/dashboard/jobs')
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
        <Skeleton className="h-8 w-64" />
        <Card><CardContent className="p-6 space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-10 w-full" /></CardContent></Card>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-emerald-100 text-emerald-700',
    DRAFT: 'bg-blue-100 text-blue-700',
    PENDING_REVIEW: 'bg-yellow-100 text-yellow-700',
    REJECTED: 'bg-red-100 text-red-700',
    CLOSED: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Edit Job</h1>
            <Badge variant="secondary" className={statusColors[form.status] || ''}>
              {form.status.replace(/_/g, ' ')}
            </Badge>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">{form.title}</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input id="title" value={form.title} onChange={(e) => update('title', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Job Description *</Label>
            <Textarea id="description" rows={6} value={form.description} onChange={(e) => update('description', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea id="requirements" rows={4} value={form.requirements} onChange={(e) => update('requirements', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="howToApply">How to Apply</Label>
            <Textarea id="howToApply" rows={3} value={form.howToApply} onChange={(e) => update('howToApply', e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={form.location} onChange={(e) => update('location', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>County</Label>
              <Select value={form.county} onValueChange={(v) => update('county', v)}>
                <SelectTrigger><SelectValue placeholder="Select county" /></SelectTrigger>
                <SelectContent>
                  {KENYAN_COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Job Type</Label>
              <Select value={form.type} onValueChange={(v) => update('type', v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{JOB_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Experience Level</Label>
              <Select value={form.experience} onValueChange={(v) => update('experience', v)}>
                <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                <SelectContent>{EXPERIENCE_LEVELS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => update('category', v)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{JOB_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salaryMin">Min Salary (KES)</Label>
              <Input id="salaryMin" type="number" value={form.salaryMin} onChange={(e) => update('salaryMin', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salaryMax">Max Salary (KES)</Label>
              <Input id="salaryMax" type="number" value={form.salaryMax} onChange={(e) => update('salaryMax', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="closingDate">Closing Date</Label>
              <Input id="closingDate" type="date" value={form.closingDate} onChange={(e) => update('closingDate', e.target.value)} />
            </div>
            <div className="flex items-center gap-3 pt-8">
              <Switch checked={form.isRemote} onCheckedChange={(v) => update('isRemote', v)} />
              <Label>Remote work allowed</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
              <Trash2 className="w-4 h-4 mr-2" /> Delete Job
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this job?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone. All applications for this job will also be removed.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={async () => {
                  await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' })
                  toast.success('Job deleted')
                  router.push('/dashboard/jobs')
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="flex gap-3">
          <Button variant="outline" onClick={save} disabled={saving}>
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </Button>
          {(form.status === 'DRAFT' || form.status === 'REJECTED') && (
            <Button className="bg-teal-700 hover:bg-teal-800 text-white" onClick={submitForReview} disabled={saving}>
              <Send className="w-4 h-4 mr-2" /> Submit for Review
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
