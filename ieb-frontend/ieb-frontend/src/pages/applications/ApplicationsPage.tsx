import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  listApplications,
  approveApplication,
  rejectApplication,
  queryApplication,
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
import { Eye, Check, X, MessageSquare } from 'lucide-react'

export function ApplicationsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [queryId, setQueryId] = useState<string | null>(null)
  const [queryText, setQueryText] = useState('')
  const [approveId, setApproveId] = useState<string | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['applications', page, search, status],
    queryFn: () =>
      listApplications({
        page,
        limit: 15,
        search: search || undefined,
        status: status || undefined,
      }),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['applications'] })

  const approveMut = useMutation({
    mutationFn: approveApplication,
    onSuccess: () => {
      toast.success('Application approved — member created')
      setApproveId(null)
      invalidate()
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectApplication(id, reason),
    onSuccess: () => {
      toast.success('Application rejected')
      setRejectId(null)
      setRejectReason('')
      invalidate()
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const queryMut = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => queryApplication(id, text),
    onSuccess: () => {
      toast.success('Query sent to applicant')
      setQueryId(null)
      setQueryText('')
      invalidate()
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  return (
    <div>
      <Header title="Membership Applications" breadcrumbs={['Home', 'Applications']} />
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap gap-2">
          <input
            className="h-10 w-64 rounded-lg border border-slate-300 bg-white px-3 text-sm"
            placeholder="Search applications..."
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
              'query',
              'verified',
              'recommended',
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
            <EmptyState title="No applications found" />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3">App #</th>
                      <th className="px-5 py-3">Applicant</th>
                      <th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.items.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-mono text-xs">{a.applicationNumber}</td>
                        <td className="px-5 py-3">
                          <p className="font-medium">{a.applicantName}</p>
                          <p className="text-xs text-slate-400">{a.email}</p>
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {a.requestedCategory?.name || '—'}
                        </td>
                        <td className="px-5 py-3">
                          <Badge status={a.status} />
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-500">
                          {formatDate(a.applicationDate)}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-wrap gap-1">
                            <Link to={`/applications/${a.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {!['approved', 'rejected', 'cancelled'].includes(a.status) && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-emerald-600"
                                  onClick={() => setApproveId(a.id)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600"
                                  onClick={() => setRejectId(a.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-amber-600"
                                  onClick={() => setQueryId(a.id)}
                                >
                                  <MessageSquare className="h-4 w-4" />
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
        title="Approve Application"
        message="This will create a new member record and generate a membership number. Continue?"
        confirmLabel="Approve"
        loading={approveMut.isPending}
      />

      <Modal
        open={!!rejectId}
        onClose={() => setRejectId(null)}
        title="Reject Application"
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
          label="Rejection reason"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Please provide a reason..."
        />
      </Modal>

      <Modal
        open={!!queryId}
        onClose={() => setQueryId(null)}
        title="Send Query to Applicant"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setQueryId(null)}>
              Cancel
            </Button>
            <Button
              loading={queryMut.isPending}
              disabled={queryText.length < 5}
              onClick={() => queryId && queryMut.mutate({ id: queryId, text: queryText })}
            >
              Send Query
            </Button>
          </>
        }
      >
        <textarea
          className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          rows={4}
          placeholder="e.g. Please upload your updated academic certificate."
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
        />
      </Modal>
    </div>
  )
}
