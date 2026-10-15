import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getRegistration } from '@/api/endpoints'
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

export function RegistrationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: r, isLoading } = useQuery({
    queryKey: ['registration', id],
    queryFn: () => getRegistration(id!),
    enabled: !!id,
  })

  if (isLoading) return <PageLoader />
  if (!r) {
    return (
      <div className="p-6">
        <p>Registration not found</p>
        <Link to="/registrations">
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
        title={r.applicantName}
        breadcrumbs={['Home', 'Registrations', r.applicationNumber]}
      />
      <div className="space-y-4 p-6">
        <Link to="/registrations">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-bold">{r.applicantName}</h2>
          <Badge status={r.status} />
          {r.registrationNumber && (
            <span className="font-mono text-sm text-slate-500">{r.registrationNumber}</span>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="Applicant Details" />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" value={r.email} />
              <Field label="Mobile" value={r.mobile} />
              <Field label="Application #" value={r.applicationNumber} />
              <Field label="Application Date" value={formatDate(r.applicationDate)} />
              <Field label="Registration Type" value={r.registrationType?.name} />
              <Field label="Discipline" value={r.engineeringDiscipline} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Qualifications" />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <Field label="Qualification" value={r.academicQualification} />
              <Field label="University" value={r.university} />
              <Field label="Graduation Year" value={r.graduationYear} />
              <Field label="Organization" value={r.currentOrganization} />
              <Field label="Designation" value={r.designation} />
              <Field label="Experience" value={r.professionalExperience} />
            </CardBody>
          </Card>
        </div>

        {r.certificate && (
          <Card>
            <CardHeader title="Certificate" />
            <CardBody className="grid gap-4 sm:grid-cols-3">
              <Field label="Certificate #" value={r.certificate.certificateNumber} />
              <Field label="Issue Date" value={formatDate(r.certificate.issueDate)} />
              <Field label="Expiry Date" value={formatDate(r.certificate.expiryDate)} />
              <Field label="Status" value={r.certificate.status} />
            </CardBody>
          </Card>
        )}

        {r.rejectionReason && (
          <Card>
            <CardHeader title="Rejection Reason" />
            <CardBody>
              <p className="text-sm text-red-700">{r.rejectionReason}</p>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  )
}
