import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listEvents, listEventTypes, createEvent } from '@/api/endpoints'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/ui/Spinner'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { formatDate, formatCurrency } from '@/lib/utils'
import { getErrorMessage } from '@/api/client'
import { toast } from 'sonner'
import { Plus, Eye } from 'lucide-react'
import { useForm } from 'react-hook-form'

export function EventsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['events', page, search, status],
    queryFn: () =>
      listEvents({
        page,
        limit: 15,
        search: search || undefined,
        status: status || undefined,
      }),
  })

  const { data: types } = useQuery({
    queryKey: ['event-types'],
    queryFn: listEventTypes,
  })

  const createMut = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      toast.success('Event created')
      setShowCreate(false)
      qc.invalidateQueries({ queryKey: ['events'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      typeId: '',
      startDate: '',
      endDate: '',
      venue: '',
      capacity: '200',
      registrationFee: '0',
      status: 'draft',
      isOnline: 'false',
    },
  })

  const onCreate = (v: Record<string, string>) => {
    createMut.mutate({
      name: v.name,
      typeId: v.typeId,
      startDate: v.startDate,
      endDate: v.endDate || v.startDate,
      venue: v.venue,
      capacity: parseInt(v.capacity) || undefined,
      registrationFee: parseFloat(v.registrationFee) || 0,
      status: v.status,
      isOnline: v.isOnline === 'true',
    })
  }

  return (
    <div>
      <Header title="Events" breadcrumbs={['Home', 'Events']} />
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <input
              className="h-10 w-56 rounded-lg border border-slate-300 bg-white px-3 text-sm"
              placeholder="Search events..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
            <select
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
            >
              <option value="">All statuses</option>
              {[
                'draft',
                'published',
                'registration_open',
                'registration_closed',
                'ongoing',
                'completed',
                'cancelled',
              ].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={() => {
              reset()
              setShowCreate(true)
            }}
          >
            <Plus className="h-4 w-4" />
            New Event
          </Button>
        </div>

        <Card>
          {isLoading ? (
            <PageLoader />
          ) : !data?.items.length ? (
            <EmptyState title="No events found" />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Code</th>
                      <th className="px-5 py-3">Name</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Registrations</th>
                      <th className="px-5 py-3">Fee</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.items.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-mono text-xs">{e.eventCode}</td>
                        <td className="px-5 py-3">
                          <p className="font-medium">{e.name}</p>
                          <p className="text-xs text-slate-400">
                            {e.isOnline ? 'Online' : e.venue}
                          </p>
                        </td>
                        <td className="px-5 py-3 text-slate-600">{e.type?.name}</td>
                        <td className="px-5 py-3 text-xs">{formatDate(e.startDate)}</td>
                        <td className="px-5 py-3">{e._count?.registrations ?? 0}</td>
                        <td className="px-5 py-3">{formatCurrency(e.registrationFee)}</td>
                        <td className="px-5 py-3">
                          <Badge status={e.status} />
                        </td>
                        <td className="px-5 py-3">
                          <Link to={`/events/${e.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                total={data.total}
                onPageChange={setPage}
              />
            </>
          )}
        </Card>
      </div>

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Event"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button loading={createMut.isPending} onClick={handleSubmit(onCreate)}>
              Create
            </Button>
          </>
        }
      >
        <form className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input label="Event Name *" {...register('name', { required: true })} />
          </div>
          <Select
            label="Type *"
            options={(types || []).map((t) => ({ value: t.id, label: t.name }))}
            placeholder="Select type"
            {...register('typeId', { required: true })}
          />
          <Select
            label="Status"
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
              { value: 'registration_open', label: 'Registration Open' },
            ]}
            {...register('status')}
          />
          <Input label="Start Date *" type="date" {...register('startDate', { required: true })} />
          <Input label="End Date" type="date" {...register('endDate')} />
          <Input label="Venue" {...register('venue')} />
          <Input label="Capacity" type="number" {...register('capacity')} />
          <Input label="Registration Fee" type="number" {...register('registrationFee')} />
          <Select
            label="Mode"
            options={[
              { value: 'false', label: 'Offline' },
              { value: 'true', label: 'Online' },
            ]}
            {...register('isOnline')}
          />
        </form>
      </Modal>
    </div>
  )
}
