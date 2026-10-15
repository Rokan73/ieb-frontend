import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  listRegistrations,
  approveRegistration,
  rejectRegistration,
} from '@/api/endpoints'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/ui/Spinner'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { formatDate } from '@/lib/utils'
import { getErrorMessage } from '@/api/client'
import { toast } from 'sonner'
import { Eye, Check, X } from 'lucide-react'

export function RegistrationsPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [approveId, setApproveId] = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['registrations', page, status, search],
    queryFn: () =>
      listRegistrations({
        page,
        limit: 15,
        status: status || undefined,
        search: search || undefined,
      }),
  })

  const approveMut = useMutation({
    mutationFn: approveRegistration,
    onSuccess: () => {
      toast.success('Registration approved — certificate generated')
      setApproveId(null)
      qc.invalidateQueries({ queryKey: ['registrations'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectRegistration(id, reason),
    onSuccess: () => {
      toast.success('Registration rejected')
      setRejectId(null)
      setRejectReason('')
      qc.invalidateQueries({ queryKey: ['registrations'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  return (
    <div>
      <Header title="Professional Registration" breadcrumbs={['Home', 'Registrations']} />
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap gap-2">
          <input
            className="h-10 w-56 rounded-lg border border-slate-300 bg-white px-3 text-sm"
            placeholder="Search..."
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
              'submitted',
              'under_review',
              'approved',
              'rejected',
            ].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <Card>
          {isLoading ? (
            <PageLoader />
          ) : !data?.items.length ? (
            <EmptyState title="No registration applications found" />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3">App #</th>
                      <th className="px-5 py-3">Applicant</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Reg #</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.items.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-mono text-xs">{r.applicationNumber}</td>
                        <td className="px-5 py-3">
                          <p className="font-medium">{r.applicantName}</p>
                          <p className="text-xs text-slate-400">{r.email}</p>
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {r.registrationType?.name}
                        </td>
                        <td className="px-5 py-3 font-mono text-xs">
                          {r.registrationNumber || '—'}
                        </td>
                        <td className="px-5 py-3">
                          <Badge status={r.status} />
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-500">
                          {formatDate(r.applicationDate)}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-1">
                            <Link to={`/registrations/${r.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {!['approved', 'rejected', 'cancelled'].includes(r.status) && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-emerald-600"
                                  onClick={() => setApproveId(r.id)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600"
                                  onClick={() => setRejectId(r.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
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

      <ConfirmDialog
        open={!!approveId}
        onClose={() => setApproveId(null)}
        onConfirm={() => approveId && approveMut.mutate(approveId)}
        title="Approve Registration"
        message="This will generate a registration number and certificate. Continue?"
        confirmLabel="Approve"
        loading={approveMut.isPending}
      />

      <Modal
        open={!!rejectId}
        onClose={() => setRejectId(null)}
        title="Reject Registration"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setRejectId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={rejectMut.isPending}
              disabled={rejectReason.length < 5}
              onClick={() =>
                rejectId && rejectMut.mutate({ id: rejectId, reason: rejectReason })
              }
            >
              Reject
            </Button>
          </>
        }
      >
        <Input
          label="Reason"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  )
}
