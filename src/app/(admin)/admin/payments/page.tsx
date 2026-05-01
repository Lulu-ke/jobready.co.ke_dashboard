'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  CreditCard,
  Megaphone,
} from 'lucide-react'
import { format } from 'date-fns'

interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  method: string | null
  reference: string | null
  description: string | null
  paidAt: string | null
  createdAt: string
  company: { id: string; name: string }
}

interface SponsoredAd {
  id: string
  title: string
  impressions: number
  clicks: number
  status: string
  startDate: string | null
  endDate: string | null
  createdAt: string
  company: { id: string; name: string }
}

interface PaymentData {
  payments: Payment[]
  sponsoredAds: SponsoredAd[]
  revenueSummary: { total: number; count: number }
  pendingPayments: { total: number; count: number }
}

const paymentStatusColors: Record<string, string> = {
  PAID: 'bg-emerald-100 text-emerald-800',
  PENDING: 'bg-amber-100 text-amber-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
}

export default function AdminPaymentsPage() {
  const [data, setData] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/payments')
      .then((res) => res.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-500 mt-1">Revenue and payment tracking</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      KES {(data?.revenueSummary.total || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Paid Transactions</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {data?.revenueSummary.count || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending Payments</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      KES {(data?.pendingPayments.total || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Sponsored Ads</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {data?.sponsoredAds?.length || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">
                    <Megaphone className="w-6 h-6 text-violet-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="sponsored">Sponsored Ads</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : data?.payments && data.payments.length > 0 ? (
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-6">Company</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.payments.map((payment) => (
                        <TableRow key={payment.id} className="hover:bg-gray-50">
                          <TableCell className="px-6 font-medium text-gray-900">
                            {payment.company.name}
                          </TableCell>
                          <TableCell className="font-medium">
                            KES {payment.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={paymentStatusColors[payment.status] || ''}>
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">{payment.method || '—'}</TableCell>
                          <TableCell className="text-sm text-gray-400 font-mono">{payment.reference || '—'}</TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12 text-center text-gray-400">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No payments yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sponsored" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : data?.sponsoredAds && data.sponsoredAds.length > 0 ? (
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-6">Ad Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Impressions</TableHead>
                        <TableHead>Clicks</TableHead>
                        <TableHead>CTR</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.sponsoredAds.map((ad) => (
                        <TableRow key={ad.id} className="hover:bg-gray-50">
                          <TableCell className="px-6 font-medium text-gray-900">{ad.title}</TableCell>
                          <TableCell className="text-sm text-gray-500">{ad.company.name}</TableCell>
                          <TableCell className="text-sm">{ad.impressions.toLocaleString()}</TableCell>
                          <TableCell className="text-sm">{ad.clicks.toLocaleString()}</TableCell>
                          <TableCell className="text-sm">
                            {ad.impressions > 0
                              ? `${((ad.clicks / ad.impressions) * 100).toFixed(1)}%`
                              : '0%'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={
                              ad.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                            }>
                              {ad.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12 text-center text-gray-400">
                  <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No sponsored ads</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
