import { useQuery } from '@tanstack/react-query'
import { getDashboard } from '@/api/endpoints'
import { Header } from '@/components/layout/Header'
import { Card, CardBody } from '@/components/ui/Card'
import { PageLoader } from '@/components/ui/Spinner'
import {
  Users,
  FileText,
  RefreshCw,
  Building2,
  Calendar,
  Award,
  UserCheck,
  Clock,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const COLORS = ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string
  value: number | string
  subtitle?: string
  icon: React.ElementType
  color: string
}) {
  return (
    <Card>
      <CardBody className="flex items-start gap-4">
        <div className={`rounded-xl p-3 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-0.5 text-2xl font-bold text-slate-900">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
        </div>
      </CardBody>
    </Card>
  )
}

export function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  })

  if (isLoading) return <PageLoader />
  if (error || !data) {
    return (
      <div>
        <Header title="Dashboard" breadcrumbs={['Home', 'Dashboard']} />
        <div className="p-6 text-center text-red-600">Failed to load dashboard data</div>
      </div>
    )
  }

  const categoryData = data.members.byCategory.map((c) => ({
    name: c.category.name,
    count: c.count,
  }))
  const disciplineData = data.members.byDiscipline.map((d) => ({
    name: d.discipline.replace(' Engineering', '').replace(' & Engineering', ''),
    count: d.count,
  }))

  return (
    <div>
      <Header title="Dashboard" breadcrumbs={['Home', 'Dashboard']} />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Members"
            value={data.members.total}
            subtitle={`${data.members.active} active`}
            icon={Users}
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            title="Applications"
            value={data.applications.pending + data.applications.underReview}
            subtitle={`${data.applications.approved} approved`}
            icon={FileText}
            color="bg-amber-50 text-amber-600"
          />
          <StatCard
            title="Renewals Pending"
            value={data.renewals.pending}
            subtitle={`Revenue ৳${data.renewals.revenue.toLocaleString()}`}
            icon={RefreshCw}
            color="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            title="Active Committees"
            value={data.committees.active}
            subtitle={`${data.committees.totalMembers} members`}
            icon={Building2}
            color="bg-purple-50 text-purple-600"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Upcoming Events"
            value={data.events.upcoming}
            subtitle={`${data.events.totalRegistrations} registrations`}
            icon={Calendar}
            color="bg-sky-50 text-sky-600"
          />
          <StatCard
            title="Ongoing Events"
            value={data.events.ongoing}
            subtitle={`${data.events.completed} completed`}
            icon={Clock}
            color="bg-indigo-50 text-indigo-600"
          />
          <StatCard
            title="Prof. Registration"
            value={data.professionalRegistration.pending + data.professionalRegistration.underReview}
            subtitle={`${data.professionalRegistration.approved} approved`}
            icon={Award}
            color="bg-rose-50 text-rose-600"
          />
          <StatCard
            title="Active Members"
            value={data.members.active}
            subtitle={`${data.members.expired} expired · ${data.members.suspended} suspended`}
            icon={UserCheck}
            color="bg-teal-50 text-teal-600"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="font-semibold text-slate-900">Members by Category</h3>
            </div>
            <CardBody>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          <Card>
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="font-semibold text-slate-900">Members by Discipline</h3>
            </div>
            <CardBody>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={disciplineData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {disciplineData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
