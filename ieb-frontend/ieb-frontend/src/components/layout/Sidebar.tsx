import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FileText,
  RefreshCw,
  Building2,
  Calendar,
  Award,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/members', label: 'Members', icon: Users },
  { to: '/applications', label: 'Applications', icon: FileText },
  { to: '/renewals', label: 'Renewals', icon: RefreshCw },
  { to: '/committees', label: 'Committees', icon: Building2 },
  { to: '/events', label: 'Events', icon: Calendar },
  { to: '/registrations', label: 'Prof. Registration', icon: Award },
]

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
}) {
  const { user } = useAuth()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col bg-navy-950 text-navy-100 transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-navy-800 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 font-bold text-white text-sm">
          IEB
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">IEB Admin</p>
            <p className="truncate text-xs text-navy-400">Management System</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3 scrollbar-thin">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'text-navy-300 hover:bg-navy-800 hover:text-white'
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-navy-800 p-3">
        {!collapsed && user && (
          <div className="mb-2 rounded-lg bg-navy-900 px-3 py-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-brand-400" />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-white">{user.fullName}</p>
                <p className="truncate text-[10px] text-navy-400 capitalize">
                  {user.roles[0]?.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-navy-400 hover:bg-navy-800 hover:text-white"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          {!collapsed && <span className="text-sm">Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
