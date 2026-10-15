import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listRenewals, approveRenewal, rejectRenewal } from '@/api/endpoints'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/ui/Spinner'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { formatDate, formatCurrency } from '@/lib/utils'
import { getErrorMessage } from '@/api/client'
import { toast } from 'sonner'
import { Check, X } from 'lucide-react'

export function RenewalsPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [approveId, setApproveId] = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['renewals', page, status],
    queryFn: () =>
      listRenewals({ page, limit: 15, status: status || undefined }),
  })

  const approveMut = useMutation({
    mutationFn: approveRenewal,
    onSuccess: () => {
      toast.success('Renewal approved — expiry updated')
      setApproveId(null)
      qc.invalidateQueries({ queryKey: ['renewals'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectRenewal(id, reason),
    onSuccess: () => {
      toast.success('Renewal rejected')
      setRejectId(null)
      setRejectReason('')
      qc.invalidateQueries({ queryKey: ['renewals'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  return (
    <div>
      <Header title="Membership Renewals" breadcrumbs={['Home', 'Renewals']} />
      <div className="space-y-4 p-6">
        <select
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
        >
          <option value="">All statuses</option>
          {['pending', 'payment_pending', 'under_review', 'approved', 'rejected'].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <Card>
          {isLoading ? (
            <PageLoader />
          ) : !data?.items.length ? (
            <EmptyState title="No renewals found" />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Renewal #</th>
                      <th className="px-5 py-3">Member</th>
                      <th className="px-5 py-3">Period</th>
                      <th className="px-5 py-3">Fee</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Requested</th>
                      <th className="px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.items.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-mono text-xs">{r.renewalNumber}</td>
                        <td className="px-5 py-3">
                          <p className="font-medium">{r.member?.fullName}</p>
                          <p className="text-xs text-slate-400">{r.member?.membershipNumber}</p>
                        </td>
                        <td className="px-5 py-3">{r.renewalPeriod.replace('_', ' ')}</td>
                        <td className="px-5 py-3">{formatCurrency(r.feeAmount)}</td>
                        <td className="px-5 py-3">
                          <Badge status={r.status} />
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-500">
                          {formatDate(r.requestedAt)}
                        </td>
                        <td className="px-5 py-3">
                          {!['approved', 'rejected', 'cancelled'].includes(r.status) && (
                            <div className="flex gap-1">
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
                            </div>
                          )}
                          {r.newExpiryDate && (
                            <span className="text-xs text-slate-400">
                              New expiry: {formatDate(r.newExpiryDate)}
                            </span>
                          )}
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
        title="Approve Renewal"
        message="This will update the member's expiry date. Continue?"
        confirmLabel="Approve"
        loading={approveMut.isPending}
      />

      <Modal
        open={!!rejectId}
        onClose={() => setRejectId(null)}
        title="Reject Renewal"
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
