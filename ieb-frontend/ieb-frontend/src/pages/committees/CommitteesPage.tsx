import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  listCommittees,
  listCommitteeTypes,
  createCommittee,
} from '@/api/endpoints'
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
import { formatDate } from '@/lib/utils'
import { getErrorMessage } from '@/api/client'
import { toast } from 'sonner'
import { Plus, Eye } from 'lucide-react'
import { useForm } from 'react-hook-form'

export function CommitteesPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['committees', page, search],
    queryFn: () => listCommittees({ page, limit: 15, search: search || undefined }),
  })

  const { data: types } = useQuery({
    queryKey: ['committee-types'],
    queryFn: listCommitteeTypes,
  })

  const createMut = useMutation({
    mutationFn: createCommittee,
    onSuccess: () => {
      toast.success('Committee created')
      setShowCreate(false)
      qc.invalidateQueries({ queryKey: ['committees'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { name: '', code: '', typeId: '', centre: '', description: '' },
  })

  return (
    <div>
      <Header title="Committees" breadcrumbs={['Home', 'Committees']} />
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <input
            className="h-10 w-64 rounded-lg border border-slate-300 bg-white px-3 text-sm"
            placeholder="Search committees..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
          <Button
            onClick={() => {
              reset()
              setShowCreate(true)
            }}
          >
            <Plus className="h-4 w-4" />
            New Committee
          </Button>
        </div>

        <Card>
          {isLoading ? (
            <PageLoader />
          ) : !data?.items.length ? (
            <EmptyState title="No committees found" />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Code</th>
                      <th className="px-5 py-3">Name</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Centre</th>
                      <th className="px-5 py-3">Members</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Tenure</th>
                      <th className="px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.items.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-mono text-xs">{c.code}</td>
                        <td className="px-5 py-3 font-medium">{c.name}</td>
                        <td className="px-5 py-3 text-slate-600">{c.type?.name}</td>
                        <td className="px-5 py-3 text-slate-600">{c.centre || '—'}</td>
                        <td className="px-5 py-3">{c._count?.members ?? 0}</td>
                        <td className="px-5 py-3">
                          <Badge status={c.status} />
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-500">
                          {formatDate(c.startDate)} – {formatDate(c.endDate)}
                        </td>
                        <td className="px-5 py-3">
                          <Link to={`/committees/${c.id}`}>
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
        title="Create Committee"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              loading={createMut.isPending}
              onClick={handleSubmit((v) => createMut.mutate(v))}
            >
              Create
            </Button>
          </>
        }
      >
        <form className="grid gap-4 sm:grid-cols-2">
          <Input label="Name *" {...register('name', { required: true })} />
          <Input label="Code *" {...register('code', { required: true })} />
          <Select
            label="Type *"
            options={(types || []).map((t) => ({ value: t.id, label: t.name }))}
            placeholder="Select type"
            {...register('typeId', { required: true })}
          />
          <Input label="Centre" {...register('centre')} />
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              className="w-full rounded-lg border border-slate-300 p-3 text-sm"
              rows={3}
              {...register('description')}
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}
