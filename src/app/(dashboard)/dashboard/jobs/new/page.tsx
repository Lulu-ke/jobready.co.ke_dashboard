'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Send } from 'lucide-react'
import { KENYAN_COUNTIES, JOB_CATEGORIES, JOB_TYPES, EXPERIENCE_LEVELS } from '@/lib/constants'
import { toast } from 'sonner'

export default function NewJobPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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
  })

  const update = (key: string, value: string | boolean) => setForm((p) => ({ ...p, [key]: value }))

  async function saveAsDraft() {
    setLoading(true)
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, status: 'DRAFT' }),
      })
      if (res.ok) {
        toast.success('Draft saved')
        router.push('/dashboard/jobs')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save')
      }
    } catch {
      toast.error('Failed to save')
    }
    setLoading(false)
  }

  async function submitForReview() {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Title and description are required')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, status: 'PENDING_REVIEW' }),
      })
      if (res.ok) {
        toast.success('Job submitted for review')
        router.push('/dashboard/jobs')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to submit')
      }
    } catch {
      toast.error('Failed to submit')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Job</h1>
          <p className="text-gray-500 text-sm mt-0.5">Fill in the details to post a new job listing</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input id="title" placeholder="e.g. Senior Software Engineer" value={form.title} onChange={(e) => update('title', e.target.value)} />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Job Description *</Label>
            <Textarea id="description" rows={6} placeholder="Describe the role, responsibilities, and what the successful candidate will do..." value={form.description} onChange={(e) => update('description', e.target.value)} />
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea id="requirements" rows={4} placeholder="List the qualifications, skills, and experience required..." value={form.requirements} onChange={(e) => update('requirements', e.target.value)} />
          </div>

          {/* How to Apply */}
          <div className="space-y-2">
            <Label htmlFor="howToApply">How to Apply</Label>
            <Textarea id="howToApply" rows={3} placeholder="Instructions for applicants on how to apply..." value={form.howToApply} onChange={(e) => update('howToApply', e.target.value)} />
          </div>

          {/* Location + County */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="e.g. Westlands" value={form.location} onChange={(e) => update('location', e.target.value)} />
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

          {/* Type + Experience + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Job Type</Label>
              <Select value={form.type} onValueChange={(v) => update('type', v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Experience Level</Label>
              <Select value={form.experience} onValueChange={(v) => update('experience', v)}>
                <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => update('category', v)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {JOB_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Salary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salaryMin">Minimum Salary (KES)</Label>
              <Input id="salaryMin" type="number" placeholder="e.g. 50000" value={form.salaryMin} onChange={(e) => update('salaryMin', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salaryMax">Maximum Salary (KES)</Label>
              <Input id="salaryMax" type="number" placeholder="e.g. 150000" value={form.salaryMax} onChange={(e) => update('salaryMax', e.target.value)} />
            </div>
          </div>

          {/* Remote + Closing Date */}
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

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button variant="outline" onClick={saveAsDraft} disabled={loading}>
          <Save className="w-4 h-4 mr-2" /> Save as Draft
        </Button>
        <Button className="bg-teal-700 hover:bg-teal-800 text-white" onClick={submitForReview} disabled={loading}>
          <Send className="w-4 h-4 mr-2" /> Submit for Review
        </Button>
      </div>
    </div>
  )
}
