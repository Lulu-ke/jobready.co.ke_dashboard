'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { Save } from 'lucide-react'

export default function AdminSettingsPage() {
  const { toast } = useToast()

  const handleSave = () => {
    toast({ title: 'Settings saved successfully' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Platform configuration</p>
        </div>
        <Button onClick={handleSave} className="bg-teal-700 hover:bg-teal-800 text-white">
          <Save className="w-4 h-4 mr-2" /> Save Changes
        </Button>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
          <CardDescription>Basic platform settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">Site Name</Label>
              <Input id="site-name" defaultValue="JobReady.co.ke" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-url">Site URL</Label>
              <Input id="site-url" defaultValue="https://www.jobready.co.ke" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Admin Email</Label>
              <Input id="admin-email" defaultValue="admin@jobready.co.ke" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-email">Support Email</Label>
              <Input id="support-email" defaultValue="support@jobready.co.ke" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-description">Site Description</Label>
            <Textarea
              id="site-description"
              defaultValue="Kenya's leading job platform connecting talented professionals with top employers across the country."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Job Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Job Settings</CardTitle>
          <CardDescription>Configure job posting defaults and policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default-expiry">Default Job Expiry (days)</Label>
              <Input id="default-expiry" type="number" defaultValue="30" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-applications">Max Applications per Job</Label>
              <Input id="max-applications" type="number" defaultValue="100" />
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Require Admin Approval</p>
              <p className="text-xs text-gray-500">All new job postings must be reviewed by an admin</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Allow Remote Jobs</p>
              <p className="text-xs text-gray-500">Employers can post remote/remote-first positions</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Email Notifications</CardTitle>
          <CardDescription>Configure email notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">New Job Alerts</p>
              <p className="text-xs text-gray-500">Send email alerts to job seekers for matching jobs</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Application Notifications</p>
              <p className="text-xs text-gray-500">Notify employers when they receive new applications</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Job Review Notifications</p>
              <p className="text-xs text-gray-500">Notify admins when new jobs are submitted for review</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Weekly Digest</p>
              <p className="text-xs text-gray-500">Send weekly summary of platform activity</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Settings</CardTitle>
          <CardDescription>Payment gateway configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Input id="currency" defaultValue="KES" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-gateway">Payment Gateway</Label>
              <Input id="payment-gateway" defaultValue="M-Pesa / Flutterwave" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="free-jobs">Free Job Postings per Month</Label>
              <Input id="free-jobs" type="number" defaultValue="3" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="featured-price">Featured Job Price (KES)</Label>
              <Input id="featured-price" type="number" defaultValue="2500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
