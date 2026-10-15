import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listMembers, listCategories, createMember, deleteMember } from '@/api/endpoints'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/ui/Spinner'
import { Modal } from '@/components/ui/Modal'
import { formatDate } from '@/lib/utils'
import { getErrorMessage } from '@/api/client'
import { toast } from 'sonner'
import { Plus, Search, Eye } from 'lucide-react'
import { useForm } from 'react-hook-form'

export function MembersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['members', page, search, status, categoryId],
    queryFn: () =>
      listMembers({
        page,
        limit: 15,
        search: search || undefined,
        status: status || undefined,
        categoryId: categoryId || undefined,
      }),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: listCategories,
  })

  const createMut = useMutation({
    mutationFn: createMember,
    onSuccess: () => {
      toast.success('Member created')
      setShowCreate(false)
      qc.invalidateQueries({ queryKey: ['members'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const deleteMut = useMutation({
    mutationFn: deleteMember,
    onSuccess: () => {
      toast.success('Member cancelled')
      qc.invalidateQueries({ queryKey: ['members'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      mobile: '',
      categoryId: '',
      engineeringDiscipline: '',
      status: 'active',
    },
  })

  const onCreate = (values: Record<string, string>) => {
    createMut.mutate({
      ...values,
      categoryId: values.categoryId,
    })
  }

  return (
    <div>
      <Header title="Members" breadcrumbs={['Home', 'Members']} />
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="h-10 w-64 rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Search name, number, email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <select
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
            >
              <option value="">All statuses</option>
              {['active', 'pending', 'suspended', 'expired', 'cancelled'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value)
                setPage(1)
              }}
            >
              <option value="">All categories</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={() => { reset(); setShowCreate(true) }}>
            <Plus className="h-4 w-4" />
            Add Member
          </Button>
        </div>

        <Card>
          {isLoading ? (
            <PageLoader />
          ) : !data?.items.length ? (
            <EmptyState title="No members found" description="Try adjusting filters or add a new member." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-medium">Membership #</th>
                      <th className="px-5 py-3 font-medium">Name</th>
                      <th className="px-5 py-3 font-medium">Category</th>
                      <th className="px-5 py-3 font-medium">Discipline</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Joined</th>
                      <th className="px-5 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.items.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-mono text-xs text-slate-600">
                          {m.membershipNumber}
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-medium text-slate-900">{m.fullName}</p>
                          <p className="text-xs text-slate-400">{m.email}</p>
                        </td>
                        <td className="px-5 py-3 text-slate-600">{m.category?.name || '—'}</td>
                        <td className="px-5 py-3 text-slate-600 text-xs">
                          {m.engineeringDiscipline || '—'}
                        </td>
                        <td className="px-5 py-3">
                          <Badge status={m.status} />
                        </td>
                        <td className="px-5 py-3 text-slate-500 text-xs">
                          {formatDate(m.joiningDate)}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-1">
                            <Link to={`/members/${m.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {m.status !== 'cancelled' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600"
                                onClick={() => {
                                  if (confirm('Cancel this member?')) deleteMut.mutate(m.id)
                                }}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
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
        title="Add New Member"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button loading={createMut.isPending} onClick={handleSubmit(onCreate)}>
              Create Member
            </Button>
          </>
        }
      >
        <form className="grid gap-4 sm:grid-cols-2">
          <Input label="Full Name *" {...register('fullName', { required: true })} />
          <Input label="Email" type="email" {...register('email')} />
          <Input label="Mobile" {...register('mobile')} />
          <Select
            label="Category *"
            options={(categories || []).map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Select category"
            {...register('categoryId', { required: true })}
          />
          <Input label="Engineering Discipline" {...register('engineeringDiscipline')} />
          <Select
            label="Status"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'pending', label: 'Pending' },
            ]}
            {...register('status')}
          />
        </form>
      </Modal>
    </div>
  )
}
