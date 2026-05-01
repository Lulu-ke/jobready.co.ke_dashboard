'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { UserPlus, Trash2, Mail, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { MEMBER_ROLES } from '@/lib/constants'

interface Member {
  id: string
  userId: string
  role: string
  joinedAt: string
  user: { id: string; name: string | null; email: string }
}

interface Invitation {
  id: string
  email: string
  role: string
  token: string
  expiresAt: string
  createdAt: string
  acceptedAt: string | null
  invitedByUser: { name: string | null }
}

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'VIEWER' })
  const [inviting, setInviting] = useState(false)

  async function fetchTeam() {
    try {
      const res = await fetch('/api/team')
      if (res.ok) {
        const data = await res.json()
        setMembers(data.members || [])
        setInvitations(data.invitations || [])
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchTeam() }, [])

  async function inviteMember() {
    if (!inviteForm.email.trim()) {
      toast.error('Email is required')
      return
    }
    setInviting(true)
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm),
      })
      if (res.ok) {
        toast.success('Invitation sent')
        setInviteForm({ email: '', role: 'VIEWER' })
        setInviteOpen(false)
        fetchTeam()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to invite')
      }
    } catch {
      toast.error('Failed to invite')
    }
    setInviting(false)
  }

  async function removeMember(memberId: string) {
    try {
      const res = await fetch(`/api/team/${memberId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Member removed')
        fetchTeam()
      }
    } catch {}
  }

  async function revokeInvitation(id: string) {
    try {
      const res = await fetch(`/api/team/invitations/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Invitation revoked')
        fetchTeam()
      }
    } catch {}
  }

  const roleColors: Record<string, string> = {
    OWNER: 'bg-purple-100 text-purple-700',
    ADMIN: 'bg-red-100 text-red-700',
    RECRUITER: 'bg-blue-100 text-blue-700',
    VIEWER: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your team members</p>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-700 hover:bg-teal-800 text-white">
              <UserPlus className="w-4 h-4 mr-2" /> Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={inviteForm.role} onValueChange={(v) => setInviteForm({ ...inviteForm, role: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEMBER_ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button className="bg-teal-700 hover:bg-teal-800 text-white" onClick={inviteMember} disabled={inviting}>
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Members Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Team Members ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Member</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Joined</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-400">Loading...</TableCell></TableRow>
                ) : members.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-400">No members yet</TableCell></TableRow>
                ) : (
                  members.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">
                              {m.user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{m.user.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{m.user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={roleColors[m.role] || ''}>
                          {m.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {format(new Date(m.joinedAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {m.role !== 'OWNER' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => removeMember(m.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Pending Invitations ({invitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Role</TableHead>
                    <TableHead className="font-semibold">Expires</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.filter(i => !i.acceptedAt).map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="text-sm text-gray-900">{inv.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={roleColors[inv.role] || ''}>
                          {inv.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {format(new Date(inv.expiresAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => revokeInvitation(inv.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
