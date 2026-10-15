import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div
        className={cn(
          'min-h-screen transition-all duration-300',
          collapsed ? 'ml-[72px]' : 'ml-64'
        )}
      >
        <Outlet />
      </div>
    </div>
  )
}
