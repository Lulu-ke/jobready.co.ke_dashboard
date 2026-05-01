'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Save, Building2, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { KENYAN_COUNTIES, COMPANY_SIZES, COMPANY_TYPES } from '@/lib/constants'

interface CompanyData {
  id: string
  name: string
  slug: string
  email: string | null
  phone: string | null
  logoUrl: string | null
  website: string | null
  description: string | null
  industry: string | null
  size: string | null
  orgType: string | null
  county: string | null
  address: string | null
  isVerified: boolean
}

export default function CompanyPage() {
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    description: '',
    industry: '',
    size: '',
    orgType: '',
    county: '',
    address: '',
  })

  useEffect(() => {
    async function fetchCompany() {
      try {
        const res = await fetch('/api/company')
        if (res.ok) {
          const data = await res.json()
          setCompany(data)
          setForm({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            website: data.website || '',
            description: data.description || '',
            industry: data.industry || '',
            size: data.size || '',
            orgType: data.orgType || '',
            county: data.county || '',
            address: data.address || '',
          })
        }
      } catch {}
      setLoading(false)
    }
    fetchCompany()
  }, [])

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }))

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success('Company profile updated')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update')
      }
    } catch {
      toast.error('Failed to update')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-8 w-48" />
        <Card><CardContent className="p-6 space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-32 w-full" /></CardContent></Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your company information</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-600" />
            Company Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input id="name" value={form.name} onChange={(e) => update('name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> Website
                </span>
              </Label>
              <Input id="website" placeholder="https://" value={form.website} onChange={(e) => update('website', e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Company Description</Label>
            <Textarea id="description" rows={4} placeholder="Tell us about your company..." value={form.description} onChange={(e) => update('description', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Industry</Label>
              <Select value={form.industry} onValueChange={(v) => update('industry', v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {['IT', 'Finance', 'Healthcare', 'Engineering', 'Education', 'Marketing', 'Manufacturing', 'Retail', 'Agriculture', 'Telecom', 'NGO', 'Government'].map((i) => (
                    <SelectItem key={i} value={i}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Company Size</Label>
              <Select value={form.size} onValueChange={(v) => update('size', v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {COMPANY_SIZES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Organization Type</Label>
              <Select value={form.orgType} onValueChange={(v) => update('orgType', v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {COMPANY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>County</Label>
              <Select value={form.county} onValueChange={(v) => update('county', v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {KENYAN_COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" placeholder="Physical address" value={form.address} onChange={(e) => update('address', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="bg-teal-700 hover:bg-teal-800 text-white" onClick={save} disabled={saving}>
          <Save className="w-4 h-4 mr-2" /> Save Changes
        </Button>
      </div>
    </div>
  )
}
