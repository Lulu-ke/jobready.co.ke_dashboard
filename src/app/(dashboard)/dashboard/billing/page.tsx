'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { CreditCard, Zap, History } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Payment {
  id: string
  reference: string
  amount: number
  purpose: string | null
  status: string
  paidAt: string | null
  createdAt: string
}

const statusColors: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-yellow-100 text-yellow-700',
  expired: 'bg-gray-100 text-gray-600',
  failed: 'bg-red-100 text-red-700',
}

export default function BillingPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [upgradePlan, setUpgradePlan] = useState('featured_job')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    async function fetchPayments() {
      try {
        const res = await fetch('/api/jobs?limit=100')
        // Payments will be fetched from a dedicated endpoint when available
      } catch {}
      // Show empty for now — payments API will be connected when backend is ready
      setLoading(false)
    }
    fetchPayments()
  }, [])

  async function handleUpgrade() {
    setProcessing(true)
    // In production, this would initiate M-Pesa payment
    toast.info('Payment integration coming soon')
    setProcessing(false)
    setUpgradeOpen(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your subscriptions and payments</p>
      </div>

      {/* Upgrade Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-teal-50 p-2 rounded-lg">
                <Zap className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Featured Job</p>
                <p className="text-xs text-gray-500">Stand out to applicants</p>
              </div>
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-2xl font-bold text-gray-900">KES 2,500</span>
              <span className="text-sm text-gray-500">/job</span>
            </div>
            <Button variant="outline" className="w-full" onClick={() => { setUpgradePlan('featured_job'); setUpgradeOpen(true) }}>
              Upgrade
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm border-2 border-teal-600 relative">
          <div className="absolute -top-2.5 right-4">
            <Badge className="bg-teal-600 text-white">Popular</Badge>
          </div>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-teal-50 p-2 rounded-lg">
                <CreditCard className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Sponsored Ad</p>
                <p className="text-xs text-gray-500">Reach more candidates</p>
              </div>
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-2xl font-bold text-gray-900">KES 5,000</span>
              <span className="text-sm text-gray-500">/week</span>
            </div>
            <Button className="w-full bg-teal-700 hover:bg-teal-800 text-white" onClick={() => { setUpgradePlan('sponsored'); setUpgradeOpen(true) }}>
              Get Started
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-teal-50 p-2 rounded-lg">
                <History className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Bulk Package</p>
                <p className="text-xs text-gray-500">10 jobs at a discount</p>
              </div>
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-2xl font-bold text-gray-900">KES 20,000</span>
              <span className="text-sm text-gray-500">/10 jobs</span>
            </div>
            <Button variant="outline" className="w-full" onClick={() => { setUpgradePlan('bulk'); setUpgradeOpen(true) }}>
              Purchase
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <History className="w-4 h-4" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : payments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No payment history yet</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">Reference</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Purpose</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-sm font-mono">{p.reference.slice(0, 8)}</TableCell>
                      <TableCell className="text-sm font-medium">KES {p.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-gray-500">{p.purpose || '—'}</TableCell>
                      <TableCell><Badge variant="secondary" className={statusColors[p.status] || ''}>{p.status}</Badge></TableCell>
                      <TableCell className="text-sm text-gray-500">{format(new Date(p.createdAt), 'MMM d, yyyy')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Dialog */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Need help with billing?</h3>
          <p className="text-xs text-gray-500 mb-3">
            Contact us at <span className="text-teal-700">billing@jobready.co.ke</span> for custom packages or enterprise plans.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
