export interface ApiSuccess<T = unknown> {
  success: true
  message: string
  data: T
  meta?: Record<string, unknown>
}

export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]> | string[]
  code?: string
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface AuthUser {
  id: string
  email: string
  fullName: string
  roles: string[]
  permissions: string[]
  mobile?: string
  isActive?: boolean
  member?: {
    id: string
    membershipNumber: string
    status: string
    category?: { name: string; code: string }
  } | null
}

export interface LoginResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

export interface Member {
  id: string
  membershipNumber: string
  fullName: string
  nameInBangla?: string | null
  fatherName?: string | null
  motherName?: string | null
  dateOfBirth?: string | null
  gender?: string | null
  nationality?: string | null
  nidPassport?: string | null
  email?: string | null
  mobile?: string | null
  alternatePhone?: string | null
  presentAddress?: string | null
  permanentAddress?: string | null
  district?: string | null
  division?: string | null
  engineeringDiscipline?: string | null
  academicQualification?: string | null
  university?: string | null
  graduationYear?: number | null
  professionalExperience?: string | null
  currentOrganization?: string | null
  currentDesignation?: string | null
  categoryId: string
  status: string
  joiningDate?: string | null
  expiryDate?: string | null
  profilePhotoUrl?: string | null
  signatureUrl?: string | null
  createdAt: string
  updatedAt: string
  category?: { id: string; name: string; code: string }
}

export interface MembershipCategory {
  id: string
  name: string
  code: string
  description?: string | null
  eligibility?: string | null
  fee: number | string
  status: string
}

export interface MembershipApplication {
  id: string
  applicationNumber: string
  applicantName: string
  email: string
  mobile: string
  dateOfBirth?: string | null
  nidPassport?: string | null
  address?: string | null
  engineeringDiscipline?: string | null
  academicQualification?: string | null
  university?: string | null
  graduationYear?: number | null
  professionalExperience?: string | null
  currentOrganization?: string | null
  designation?: string | null
  requestedCategoryId: string
  declarationAccepted: boolean
  status: string
  memberId?: string | null
  applicationDate: string
  rejectionReason?: string | null
  createdAt: string
  updatedAt: string
  requestedCategory?: { id: string; name: string; code: string }
  member?: { id: string; membershipNumber: string } | null
  documents?: unknown[]
  queries?: unknown[]
  history?: unknown[]
}

export interface MembershipRenewal {
  id: string
  renewalNumber: string
  memberId: string
  categoryId: string
  renewalPeriod: string
  feeAmount: number | string
  paymentStatus: string
  status: string
  contactEmail?: string | null
  contactMobile?: string | null
  requestedAt: string
  rejectionReason?: string | null
  newExpiryDate?: string | null
  createdAt: string
  member?: {
    id: string
    membershipNumber: string
    fullName: string
    status: string
    expiryDate?: string | null
  }
  category?: { id: string; name: string; code: string; fee?: number | string }
  history?: unknown[]
}

export interface Committee {
  id: string
  name: string
  code: string
  typeId: string
  description?: string | null
  centre?: string | null
  location?: string | null
  startDate?: string | null
  endDate?: string | null
  status: string
  createdAt: string
  type?: { id: string; name: string; code: string }
  members?: CommitteeMember[]
  _count?: { members: number }
}

export interface CommitteeMember {
  id: string
  committeeId: string
  memberId: string
  positionId: string
  appointmentDate?: string | null
  startDate?: string | null
  endDate?: string | null
  status: string
  member?: {
    id: string
    membershipNumber: string
    fullName: string
    email?: string | null
    mobile?: string | null
  }
  position?: { id: string; name: string; code: string; sortOrder?: number }
}

export interface CommitteeType {
  id: string
  name: string
  code: string
  status: string
}

export interface CommitteePosition {
  id: string
  name: string
  code: string
  sortOrder: number
}

export interface Event {
  id: string
  eventCode: string
  name: string
  typeId: string
  description?: string | null
  organizer?: string | null
  centre?: string | null
  venue?: string | null
  isOnline: boolean
  startDate: string
  endDate: string
  startTime?: string | null
  endTime?: string | null
  registrationStart?: string | null
  registrationEnd?: string | null
  capacity?: number | null
  registrationFee: number | string
  status: string
  featuredImageUrl?: string | null
  createdAt: string
  type?: { id: string; name: string; code: string }
  _count?: { registrations: number }
}

export interface EventRegistration {
  id: string
  registrationNumber: string
  eventId: string
  memberId?: string | null
  name: string
  email: string
  mobile?: string | null
  paymentStatus: string
  attendanceStatus: string
  registrationDate: string
  member?: { membershipNumber: string; fullName: string } | null
}

export interface EventType {
  id: string
  name: string
  code: string
  status: string
}

export interface ProfessionalRegistration {
  id: string
  applicationNumber: string
  registrationNumber?: string | null
  memberId?: string | null
  applicantName: string
  email: string
  mobile?: string | null
  registrationTypeId: string
  engineeringDiscipline?: string | null
  academicQualification?: string | null
  university?: string | null
  graduationYear?: number | null
  professionalExperience?: string | null
  currentOrganization?: string | null
  designation?: string | null
  experienceDetails?: string | null
  status: string
  applicationDate: string
  rejectionReason?: string | null
  approvedAt?: string | null
  createdAt: string
  registrationType?: { id: string; name: string; code: string }
  member?: { membershipNumber: string; fullName: string } | null
  certificate?: {
    certificateNumber: string
    issueDate: string
    expiryDate?: string | null
    status: string
  } | null
  documents?: unknown[]
  history?: unknown[]
}

export interface RegistrationType {
  id: string
  name: string
  code: string
  status: string
}

export interface DashboardData {
  members: {
    total: number
    active: number
    pending: number
    expired: number
    suspended: number
    byCategory: Array<{ category: { id: string; name: string; code: string }; count: number }>
    byDiscipline: Array<{ discipline: string; count: number }>
  }
  applications: {
    pending: number
    underReview: number
    approved: number
    rejected: number
    draft: number
  }
  renewals: {
    due: number
    pending: number
    completed: number
    rejected: number
    revenue: number
  }
  committees: {
    total: number
    active: number
    expired: number
    totalMembers: number
    byType: Array<{ type: { id: string; name: string; code: string }; count: number }>
  }
  events: {
    total: number
    upcoming: number
    ongoing: number
    completed: number
    cancelled: number
    totalRegistrations: number
  }
  professionalRegistration: {
    pending: number
    underReview: number
    approved: number
    rejected: number
  }
}

export interface ListParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  sort?: string
  order?: 'asc' | 'desc'
  [key: string]: string | number | undefined
}
