import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCommittee } from '@/api/endpoints'
import { Header } from '@/components/layout/Header'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/Spinner'
import { formatDate } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

export function CommitteeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: c, isLoading } = useQuery({
    queryKey: ['committee', id],
    queryFn: () => getCommittee(id!),
    enabled: !!id,
  })

  if (isLoading) return <PageLoader />
  if (!c) {
    return (
      <div className="p-6">
        <p>Committee not found</p>
        <Link to="/committees">
          <Button variant="outline" className="mt-4">
            Back
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Header title={c.name} breadcrumbs={['Home', 'Committees', c.code]} />
      <div className="space-y-4 p-6">
        <Link to="/committees">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-bold">{c.name}</h2>
          <Badge status={c.status} />
          <span className="font-mono text-sm text-slate-500">{c.code}</span>
        </div>

        <Card>
          <CardHeader title="Committee Information" />
          <CardBody className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-slate-400">Type</p>
              <p className="text-sm font-medium">{c.type?.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Centre</p>
              <p className="text-sm font-medium">{c.centre || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Tenure</p>
              <p className="text-sm font-medium">
                {formatDate(c.startDate)} – {formatDate(c.endDate)}
              </p>
            </div>
            {c.description && (
              <div className="sm:col-span-3">
                <p className="text-xs text-slate-400">Description</p>
                <p className="text-sm">{c.description}</p>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={`Members (${c.members?.length || 0})`} />
          <CardBody className="p-0">
            {!c.members?.length ? (
              <p className="p-5 text-sm text-slate-500">No members assigned</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Position</th>
                    <th className="px-5 py-3">Member</th>
                    <th className="px-5 py-3">Membership #</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Tenure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {c.members.map((cm) => (
                    <tr key={cm.id}>
                      <td className="px-5 py-3 font-medium">{cm.position?.name}</td>
                      <td className="px-5 py-3">{cm.member?.fullName}</td>
                      <td className="px-5 py-3 font-mono text-xs">
                        {cm.member?.membershipNumber}
                      </td>
                      <td className="px-5 py-3">
                        <Badge status={cm.status} />
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500">
                        {formatDate(cm.startDate)} – {formatDate(cm.endDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
