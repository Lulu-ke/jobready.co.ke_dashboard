'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Search, Eye, MoreHorizontal, Ban, CheckCircle2, ShieldCheck, Trash2, Building2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

interface Company {
  id: string
  name: string
  slug: string
  logo: string | null
  industry: string | null
  location: string | null
  isVerified: boolean
  isSuspended: boolean
  createdAt: string
  _count: { members: number; jobs: number }
}

export default function AdminEmployersPage() {
  const { toast } = useToast()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchCompanies = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/employers?${params}`)
      const data = await res.json()
      setCompanies(data.companies || [])
    } catch {
      toast({ title: 'Failed to load employers', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [search, toast])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  const handleAction = async (id: string, action: string) => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/employers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error()
      toast({ title: `Employer ${action}d successfully` })
      fetchCompanies()
    } catch {
      toast({ title: 'Action failed', variant: 'destructive' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setActionLoading(deleteId)
    try {
      const res = await fetch(`/api/admin/employers/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast({ title: 'Employer deleted' })
      setDeleteId(null)
      fetchCompanies()
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' })
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Employers</h1>
        <p className="text-gray-500 mt-1">Manage registered companies</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search employers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : companies.length > 0 ? (
            <div className="max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">Company</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Jobs</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="px-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id} className="hover:bg-gray-50">
                      <TableCell className="px-6">
                        <Link href={`/admin/employers/${company.id}`} className="flex items-center gap-2 hover:text-teal-700 transition-colors">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-gray-900">{company.name}</span>
                              {company.isVerified && (
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                              )}
                            </div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{company.industry || '—'}</TableCell>
                      <TableCell className="text-sm text-gray-500">{company.location || '—'}</TableCell>
                      <TableCell className="text-sm text-gray-600">{company._count.members}</TableCell>
                      <TableCell className="text-sm text-gray-600">{company._count.jobs}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {company.isSuspended && (
                            <Badge variant="secondary" className="bg-red-100 text-red-800">Suspended</Badge>
                          )}
                          {company.isVerified && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">Verified</Badge>
                          )}
                          {!company.isSuspended && !company.isVerified && (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600">Active</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {format(new Date(company.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="px-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/admin/employers/${company.id}`}>
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" /> View Details
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            {company.isSuspended ? (
                              <DropdownMenuItem onClick={() => handleAction(company.id, 'activate')}>
                                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" /> Activate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleAction(company.id, 'suspend')}>
                                <Ban className="w-4 h-4 mr-2 text-red-600" /> Suspend
                              </DropdownMenuItem>
                            )}
                            {company.isVerified ? (
                              <DropdownMenuItem onClick={() => handleAction(company.id, 'unverify')}>
                                <ShieldCheck className="w-4 h-4 mr-2" /> Remove Verification
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleAction(company.id, 'verify')}>
                                <ShieldCheck className="w-4 h-4 mr-2 text-blue-600" /> Verify
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteId(company.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400">
              <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No employers found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employer</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All company data, jobs, and related records will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
