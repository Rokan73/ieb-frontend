import api from './client'
import type {
  ApiSuccess,
  Paginated,
  LoginResponse,
  AuthUser,
  Member,
  MembershipCategory,
  MembershipApplication,
  MembershipRenewal,
  Committee,
  CommitteeType,
  CommitteePosition,
  Event,
  EventRegistration,
  EventType,
  ProfessionalRegistration,
  RegistrationType,
  DashboardData,
  ListParams,
} from '@/types/api'

function qs(params?: ListParams) {
  if (!params) return ''
  const sp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') sp.set(k, String(v))
  })
  const s = sp.toString()
  return s ? `?${s}` : ''
}

// Auth
export async function login(email: string, password: string) {
  const { data } = await api.post<ApiSuccess<LoginResponse>>('/auth/login', { email, password })
  return data.data
}

export async function getMe() {
  const { data } = await api.get<ApiSuccess<AuthUser>>('/auth/me')
  return data.data
}

export async function logout() {
  try {
    await api.post('/auth/logout')
  } catch {
    /* ignore */
  }
}

// Dashboard
export async function getDashboard() {
  const { data } = await api.get<ApiSuccess<DashboardData>>('/dashboard')
  return data.data
}

// Members
export async function listMembers(params?: ListParams) {
  const { data } = await api.get<ApiSuccess<Paginated<Member>>>(`/members${qs(params)}`)
  return data.data
}

export async function getMember(id: string) {
  const { data } = await api.get<ApiSuccess<Member>>(`/members/${id}`)
  return data.data
}

export async function createMember(body: Record<string, unknown>) {
  const { data } = await api.post<ApiSuccess<Member>>('/members', body)
  return data.data
}

export async function updateMember(id: string, body: Record<string, unknown>) {
  const { data } = await api.put<ApiSuccess<Member>>(`/members/${id}`, body)
  return data.data
}

export async function deleteMember(id: string) {
  const { data } = await api.delete<ApiSuccess<Member>>(`/members/${id}`)
  return data.data
}

export async function listCategories() {
  const { data } = await api.get<ApiSuccess<MembershipCategory[]>>('/members/categories')
  return data.data
}

export async function getMemberStats() {
  const { data } = await api.get<ApiSuccess<unknown>>('/members/stats')
  return data.data
}

// Applications
export async function listApplications(params?: ListParams) {
  const { data } = await api.get<ApiSuccess<Paginated<MembershipApplication>>>(
    `/membership-applications${qs(params)}`
  )
  return data.data
}

export async function getApplication(id: string) {
  const { data } = await api.get<ApiSuccess<MembershipApplication>>(`/membership-applications/${id}`)
  return data.data
}

export async function updateApplication(id: string, body: Record<string, unknown>) {
  const { data } = await api.put<ApiSuccess<MembershipApplication>>(
    `/membership-applications/${id}`,
    body
  )
  return data.data
}

export async function submitApplication(id: string) {
  const { data } = await api.post<ApiSuccess<MembershipApplication>>(
    `/membership-applications/${id}/submit`
  )
  return data.data
}

export async function queryApplication(id: string, queryText: string) {
  const { data } = await api.post<ApiSuccess<MembershipApplication>>(
    `/membership-applications/${id}/query`,
    { queryText }
  )
  return data.data
}

export async function approveApplication(id: string) {
  const { data } = await api.post<ApiSuccess<MembershipApplication>>(
    `/membership-applications/${id}/approve`
  )
  return data.data
}

export async function rejectApplication(id: string, reason: string) {
  const { data } = await api.post<ApiSuccess<MembershipApplication>>(
    `/membership-applications/${id}/reject`,
    { reason }
  )
  return data.data
}

// Renewals
export async function listRenewals(params?: ListParams) {
  const { data } = await api.get<ApiSuccess<Paginated<MembershipRenewal>>>(
    `/membership-renewals${qs(params)}`
  )
  return data.data
}

export async function getRenewal(id: string) {
  const { data } = await api.get<ApiSuccess<MembershipRenewal>>(`/membership-renewals/${id}`)
  return data.data
}

export async function createRenewal(body: {
  memberId: string
  renewalPeriod: string
  contactEmail?: string
  contactMobile?: string
}) {
  const { data } = await api.post<ApiSuccess<MembershipRenewal>>('/membership-renewals', body)
  return data.data
}

export async function approveRenewal(id: string) {
  const { data } = await api.post<ApiSuccess<MembershipRenewal>>(`/membership-renewals/${id}/approve`)
  return data.data
}

export async function rejectRenewal(id: string, reason: string) {
  const { data } = await api.post<ApiSuccess<MembershipRenewal>>(`/membership-renewals/${id}/reject`, {
    reason,
  })
  return data.data
}

// Committees
export async function listCommittees(params?: ListParams) {
  const { data } = await api.get<ApiSuccess<Paginated<Committee>>>(`/committees${qs(params)}`)
  return data.data
}

export async function getCommittee(id: string) {
  const { data } = await api.get<ApiSuccess<Committee>>(`/committees/${id}`)
  return data.data
}

export async function createCommittee(body: Record<string, unknown>) {
  const { data } = await api.post<ApiSuccess<Committee>>('/committees', body)
  return data.data
}

export async function updateCommittee(id: string, body: Record<string, unknown>) {
  const { data } = await api.put<ApiSuccess<Committee>>(`/committees/${id}`, body)
  return data.data
}

export async function addCommitteeMember(
  committeeId: string,
  body: { memberId: string; positionId: string; startDate?: string; endDate?: string }
) {
  const { data } = await api.post(`/committees/${committeeId}/members`, body)
  return data.data
}

export async function removeCommitteeMember(committeeId: string, cmId: string) {
  const { data } = await api.delete(`/committees/${committeeId}/members/${cmId}`)
  return data.data
}

export async function listCommitteeTypes() {
  const { data } = await api.get<ApiSuccess<CommitteeType[]>>('/committees/types')
  return data.data
}

export async function listCommitteePositions() {
  const { data } = await api.get<ApiSuccess<CommitteePosition[]>>('/committees/positions')
  return data.data
}

// Events
export async function listEvents(params?: ListParams) {
  const { data } = await api.get<ApiSuccess<Paginated<Event>>>(`/events${qs(params)}`)
  return data.data
}

export async function getEvent(id: string) {
  const { data } = await api.get<ApiSuccess<Event>>(`/events/${id}`)
  return data.data
}

export async function createEvent(body: Record<string, unknown>) {
  const { data } = await api.post<ApiSuccess<Event>>('/events', body)
  return data.data
}

export async function updateEvent(id: string, body: Record<string, unknown>) {
  const { data } = await api.put<ApiSuccess<Event>>(`/events/${id}`, body)
  return data.data
}

export async function listParticipants(eventId: string, params?: ListParams) {
  const { data } = await api.get<ApiSuccess<Paginated<EventRegistration>>>(
    `/events/${eventId}/participants${qs(params)}`
  )
  return data.data
}

export async function markAttendance(
  eventId: string,
  regId: string,
  attendanceStatus: 'attended' | 'absent'
) {
  const { data } = await api.patch(`/events/${eventId}/participants/${regId}`, { attendanceStatus })
  return data.data
}

export async function listEventTypes() {
  const { data } = await api.get<ApiSuccess<EventType[]>>('/events/types')
  return data.data
}

// Professional Registration
export async function listRegistrations(params?: ListParams) {
  const { data } = await api.get<ApiSuccess<Paginated<ProfessionalRegistration>>>(
    `/professional-registrations${qs(params)}`
  )
  return data.data
}

export async function getRegistration(id: string) {
  const { data } = await api.get<ApiSuccess<ProfessionalRegistration>>(
    `/professional-registrations/${id}`
  )
  return data.data
}

export async function submitRegistration(id: string) {
  const { data } = await api.post(`/professional-registrations/${id}/submit`)
  return data.data
}

export async function approveRegistration(id: string) {
  const { data } = await api.post(`/professional-registrations/${id}/approve`)
  return data.data
}

export async function rejectRegistration(id: string, reason: string) {
  const { data } = await api.post(`/professional-registrations/${id}/reject`, { reason })
  return data.data
}

export async function listRegistrationTypes() {
  const { data } = await api.get<ApiSuccess<RegistrationType[]>>('/professional-registrations/types')
  return data.data
}

// Public
export async function verifyMember(membershipNumber: string) {
  const { data } = await api.get(`/public/verify-member/${membershipNumber}`)
  return data.data
}

export async function verifyRegistration(registrationNumber: string) {
  const { data } = await api.get(`/public/verify-registration/${registrationNumber}`)
  return data.data
}
