'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users,
  Building2,
  BarChart3,
  CreditCard,
  Bell,
  Settings,
  Menu,
  LogOut,
  ChevronRight,
} from 'lucide-react'

interface CompanyInfo {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  industry: string | null
  size: string | null
  isVerified: boolean
}

interface UserInfo {
  id: string
  name: string
  email: string
  role: string
  companyId: string
  companyName: string
  memberRole: string
}

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/dashboard/applications', label: 'Applications', icon: FileText },
  { href: '/dashboard/team', label: 'Team', icon: Users },
  { href: '/dashboard/company', label: 'Company', icon: Building2 },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

function SidebarContent({ pathname, user, company, onNavigate }: {
  pathname: string
  user: UserInfo
  company: CompanyInfo
  onNavigate?: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700/50">
        <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">JobReady</h1>
            <p className="text-[11px] text-slate-400">Employer Portal</p>
          </div>
        </Link>
      </div>

      {/* Company Info */}
      <div className="px-4 py-3 border-b border-slate-700/50">
        <p className="text-xs text-slate-400 mb-1">Company</p>
        <div className="flex items-center gap-2">
          {company.logoUrl ? (
            <img src={company.logoUrl} alt="" className="w-7 h-7 rounded object-cover" />
          ) : (
            <div className="w-7 h-7 rounded bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
              {company.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{company.name}</p>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 capitalize">{user.memberRole}</span>
              {company.isVerified && (
                <span className="text-[10px] bg-teal-600/20 text-teal-400 px-1.5 py-0.5 rounded-full">✓</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 py-3">
        <nav className="space-y-0.5 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-teal-600/20 text-teal-400'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <item.icon className="w-[18px] h-[18px] shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.label === 'Notifications' && user.unreadCount > 0 && (
                  <Badge className="bg-teal-600 text-white text-[10px] px-1.5 py-0 h-5 min-w-5">
                    {user.unreadCount}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* User */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-slate-700 text-white text-xs">
              {user.name?.charAt(0)?.toUpperCase() || 'E'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardShell({
  user,
  company,
  unreadCount,
  children,
}: {
  user: UserInfo
  company: CompanyInfo
  unreadCount: number
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const enhancedUser = { ...user, unreadCount }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-slate-900 text-white fixed inset-y-0 left-0 z-30">
        <SidebarContent pathname={pathname} user={enhancedUser} company={company} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white border-b px-4 sm:px-6 py-3 flex items-center gap-4">
          {/* Mobile Hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="w-5 h-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 bg-slate-900 border-slate-700">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SidebarContent
                pathname={pathname}
                user={enhancedUser}
                company={company}
                onNavigate={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>

          {/* Breadcrumb / Page Title */}
          <div className="flex-1 min-w-0">
            <nav className="flex items-center gap-1 text-sm">
              <span className="text-muted-foreground">Dashboard</span>
              {pathname !== '/dashboard' && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-medium text-foreground truncate">
                    {navItems.find(i => i.href !== '/dashboard' && pathname.startsWith(i.href))?.label || 'Page'}
                  </span>
                </>
              )}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Link href="/dashboard/notifications">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-teal-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="ghost" size="icon">
                <Settings className="w-4.5 h-4.5" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
