'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollText, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

interface AuditLog {
  id: string
  action: string
  target: string | null
  details: string | null
  ip: string | null
  createdAt: string
  user: { id: string; name: string | null; email: string }
}

const actionColors: Record<string, string> = {
  JOB_APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  JOB_REJECTED: 'bg-red-100 text-red-800 border-red-200',
  EMPLOYER_SUSPENDED: 'bg-red-100 text-red-800 border-red-200',
  EMPLOYER_ACTIVATED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  EMPLOYER_VERIFIED: 'bg-blue-100 text-blue-800 border-blue-200',
  EMPLOYER_UNVERIFIED: 'bg-gray-100 text-gray-800 border-gray-200',
  EMPLOYER_DELETED: 'bg-gray-100 text-gray-700 border-gray-300',
  USER_SUSPENDED: 'bg-red-100 text-red-800 border-red-200',
  USER_ACTIVATED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  USER_ROLE_CHANGED: 'bg-violet-100 text-violet-800 border-violet-200',
  USER_DELETED: 'bg-gray-100 text-gray-700 border-gray-300',
}

const actionLabels: Record<string, string> = {
  JOB_APPROVED: 'Approved Job',
  JOB_REJECTED: 'Rejected Job',
  EMPLOYER_SUSPENDED: 'Suspended Employer',
  EMPLOYER_ACTIVATED: 'Activated Employer',
  EMPLOYER_VERIFIED: 'Verified Employer',
  EMPLOYER_UNVERIFIED: 'Unverified Employer',
  EMPLOYER_DELETED: 'Deleted Employer',
  USER_SUSPENDED: 'Suspended User',
  USER_ACTIVATED: 'Activated User',
  USER_ROLE_CHANGED: 'Changed User Role',
  USER_DELETED: 'Deleted User',
}

export default function AdminAuditPage() {
  const { toast } = useToast()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState('ALL')
  const [page, setPage] = useState(1)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' })
      if (actionFilter !== 'ALL') params.set('action', actionFilter)
      const res = await fetch(`/api/admin/audit?${params}`)
      const data = await res.json()
      setLogs(data.logs || [])
    } catch {
      toast({ title: 'Failed to load audit logs', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [actionFilter, page, toast])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const parseDetails = (details: string | null): Record<string, unknown> | null => {
    if (!details) return null
    try {
      return JSON.parse(details)
    } catch {
      return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-gray-500 mt-1">Track all admin actions on the platform</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs} className="gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Actions</SelectItem>
                <SelectItem value="JOB_APPROVED">Job Approved</SelectItem>
                <SelectItem value="JOB_REJECTED">Job Rejected</SelectItem>
                <SelectItem value="EMPLOYER_SUSPENDED">Employer Suspended</SelectItem>
                <SelectItem value="EMPLOYER_ACTIVATED">Employer Activated</SelectItem>
                <SelectItem value="EMPLOYER_VERIFIED">Employer Verified</SelectItem>
                <SelectItem value="USER_SUSPENDED">User Suspended</SelectItem>
                <SelectItem value="USER_ACTIVATED">User Activated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : logs.length > 0 ? (
            <div className="max-h-[700px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">Timestamp</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const details = parseDetails(log.details)
                    return (
                      <TableRow key={log.id} className="hover:bg-gray-50">
                        <TableCell className="px-6">
                          <div className="text-sm text-gray-900">
                            {format(new Date(log.createdAt), 'MMM d, yyyy')}
                          </div>
                          <div className="text-xs text-gray-400">
                            {format(new Date(log.createdAt), 'h:mm:ss a')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {log.user.name || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-400">{log.user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[11px] px-2 py-0.5 font-medium ${actionColors[log.action] || 'bg-gray-50 text-gray-700 border-gray-200'}`}
                          >
                            {actionLabels[log.action] || log.action.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {details ? (
                            <div className="text-xs text-gray-500 space-y-0.5">
                              {details.title && (
                                <p className="truncate max-w-[200px]">
                                  <span className="text-gray-400">Title:</span> {String(details.title)}
                                </p>
                              )}
                              {details.companyName && (
                                <p className="truncate max-w-[200px]">
                                  <span className="text-gray-400">Company:</span> {String(details.companyName)}
                                </p>
                              )}
                              {details.reason && (
                                <p className="truncate max-w-[200px]">
                                  <span className="text-gray-400">Reason:</span> {String(details.reason)}
                                </p>
                              )}
                              {details.userName && (
                                <p className="truncate max-w-[200px]">
                                  <span className="text-gray-400">User:</span> {String(details.userName)}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-gray-400 font-mono">
                          {log.ip || '—'}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400">
              <ScrollText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No audit logs found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
