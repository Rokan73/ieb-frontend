import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getApplication } from '@/api/endpoints'
import { Header } from '@/components/layout/Header'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/Spinner'
import { formatDate } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm text-slate-900">{value || '—'}</p>
    </div>
  )
}

export function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: a, isLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: () => getApplication(id!),
    enabled: !!id,
  })

  if (isLoading) return <PageLoader />
  if (!a) {
    return (
      <div className="p-6">
        <p>Application not found</p>
        <Link to="/applications">
          <Button variant="outline" className="mt-4">
            Back
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Header
        title={a.applicantName}
        breadcrumbs={['Home', 'Applications', a.applicationNumber]}
      />
      <div className="space-y-4 p-6">
        <Link to="/applications">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-bold">{a.applicantName}</h2>
          <Badge status={a.status} />
          <span className="font-mono text-sm text-slate-500">{a.applicationNumber}</span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="Applicant Details" />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" value={a.email} />
              <Field label="Mobile" value={a.mobile} />
              <Field label="Date of Birth" value={formatDate(a.dateOfBirth)} />
              <Field label="NID / Passport" value={a.nidPassport} />
              <Field label="Address" value={a.address} />
              <Field label="Application Date" value={formatDate(a.applicationDate)} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Professional Details" />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <Field label="Requested Category" value={a.requestedCategory?.name} />
              <Field label="Discipline" value={a.engineeringDiscipline} />
              <Field label="Qualification" value={a.academicQualification} />
              <Field label="University" value={a.university} />
              <Field label="Graduation Year" value={a.graduationYear} />
              <Field label="Organization" value={a.currentOrganization} />
              <Field label="Designation" value={a.designation} />
              {a.member && (
                <Field label="Created Member #" value={a.member.membershipNumber} />
              )}
            </CardBody>
          </Card>
        </div>

        {a.rejectionReason && (
          <Card>
            <CardHeader title="Rejection Reason" />
            <CardBody>
              <p className="text-sm text-red-700">{a.rejectionReason}</p>
            </CardBody>
          </Card>
        )}

        {Array.isArray(a.history) && a.history.length > 0 && (
          <Card>
            <CardHeader title="Application History" />
            <CardBody>
              <div className="space-y-3">
                {(a.history as Array<{ action: string; fromStatus?: string; toStatus?: string; createdAt: string; notes?: string }>).map(
                  (h, i) => (
                    <div key={i} className="flex gap-3 border-b border-slate-100 pb-3 last:border-0">
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{h.action}</p>
                        <p className="text-xs text-slate-500">
                          {h.fromStatus && `${h.fromStatus} → `}
                          {h.toStatus} · {formatDate(h.createdAt)}
                        </p>
                        {h.notes && <p className="mt-1 text-xs text-slate-600">{h.notes}</p>}
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  )
}
