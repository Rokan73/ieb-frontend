import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getMember } from '@/api/endpoints'
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

export function MemberDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: m, isLoading } = useQuery({
    queryKey: ['member', id],
    queryFn: () => getMember(id!),
    enabled: !!id,
  })

  if (isLoading) return <PageLoader />
  if (!m) {
    return (
      <div className="p-6">
        <p>Member not found</p>
        <Link to="/members">
          <Button variant="outline" className="mt-4">
            Back
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Header title={m.fullName} breadcrumbs={['Home', 'Members', m.membershipNumber]} />
      <div className="space-y-4 p-6">
        <Link to="/members">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back to members
          </Button>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-bold text-slate-900">{m.fullName}</h2>
          <Badge status={m.status} />
          <span className="font-mono text-sm text-slate-500">{m.membershipNumber}</span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="Personal Information" />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" value={m.email} />
              <Field label="Mobile" value={m.mobile} />
              <Field label="Gender" value={m.gender} />
              <Field label="Date of Birth" value={formatDate(m.dateOfBirth)} />
              <Field label="Nationality" value={m.nationality} />
              <Field label="NID / Passport" value={m.nidPassport} />
              <Field label="Father's Name" value={m.fatherName} />
              <Field label="District" value={m.district} />
              <Field label="Present Address" value={m.presentAddress} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Professional Information" />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <Field label="Category" value={m.category?.name} />
              <Field label="Discipline" value={m.engineeringDiscipline} />
              <Field label="Qualification" value={m.academicQualification} />
              <Field label="University" value={m.university} />
              <Field label="Graduation Year" value={m.graduationYear} />
              <Field label="Organization" value={m.currentOrganization} />
              <Field label="Designation" value={m.currentDesignation} />
              <Field label="Joining Date" value={formatDate(m.joiningDate)} />
              <Field label="Expiry Date" value={formatDate(m.expiryDate)} />
            </CardBody>
          </Card>
        </div>

        {m.professionalExperience && (
          <Card>
            <CardHeader title="Professional Experience" />
            <CardBody>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{m.professionalExperience}</p>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  )
}
