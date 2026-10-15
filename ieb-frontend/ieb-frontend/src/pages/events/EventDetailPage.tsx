import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEvent, listParticipants, markAttendance } from '@/api/endpoints'
import { Header } from '@/components/layout/Header'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/Spinner'
import { formatDate, formatCurrency } from '@/lib/utils'
import { getErrorMessage } from '@/api/client'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => getEvent(id!),
    enabled: !!id,
  })

  const { data: participants } = useQuery({
    queryKey: ['participants', id],
    queryFn: () => listParticipants(id!, { limit: 50 }),
    enabled: !!id,
  })

  const attendMut = useMutation({
    mutationFn: ({ regId, status }: { regId: string; status: 'attended' | 'absent' }) =>
      markAttendance(id!, regId, status),
    onSuccess: () => {
      toast.success('Attendance updated')
      qc.invalidateQueries({ queryKey: ['participants', id] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  if (isLoading) return <PageLoader />
  if (!event) {
    return (
      <div className="p-6">
        <p>Event not found</p>
        <Link to="/events">
          <Button variant="outline" className="mt-4">
            Back
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Header title={event.name} breadcrumbs={['Home', 'Events', event.eventCode]} />
      <div className="space-y-4 p-6">
        <Link to="/events">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-bold">{event.name}</h2>
          <Badge status={event.status} />
          <span className="font-mono text-sm text-slate-500">{event.eventCode}</span>
        </div>

        <Card>
          <CardHeader title="Event Details" />
          <CardBody className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-slate-400">Type</p>
              <p className="text-sm font-medium">{event.type?.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Date</p>
              <p className="text-sm font-medium">
                {formatDate(event.startDate)}
                {event.endDate !== event.startDate && ` – ${formatDate(event.endDate)}`}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Venue</p>
              <p className="text-sm font-medium">
                {event.isOnline ? 'Online' : event.venue || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Capacity</p>
              <p className="text-sm font-medium">{event.capacity ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Fee</p>
              <p className="text-sm font-medium">{formatCurrency(event.registrationFee)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Registrations</p>
              <p className="text-sm font-medium">{event._count?.registrations ?? 0}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={`Participants (${participants?.total ?? 0})`} />
          <CardBody className="p-0">
            {!participants?.items.length ? (
              <p className="p-5 text-sm text-slate-500">No participants yet</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Reg #</th>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Payment</th>
                    <th className="px-5 py-3">Attendance</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {participants.items.map((p) => (
                    <tr key={p.id}>
                      <td className="px-5 py-3 font-mono text-xs">{p.registrationNumber}</td>
                      <td className="px-5 py-3 font-medium">{p.name}</td>
                      <td className="px-5 py-3 text-slate-600">{p.email}</td>
                      <td className="px-5 py-3">
                        <Badge status={p.paymentStatus} />
                      </td>
                      <td className="px-5 py-3">
                        <Badge status={p.attendanceStatus} />
                      </td>
                      <td className="px-5 py-3">
                        {p.attendanceStatus === 'registered' && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                attendMut.mutate({ regId: p.id, status: 'attended' })
                              }
                            >
                              Attended
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                attendMut.mutate({ regId: p.id, status: 'absent' })
                              }
                            >
                              Absent
                            </Button>
                          </div>
                        )}
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
