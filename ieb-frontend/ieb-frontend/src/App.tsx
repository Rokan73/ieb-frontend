import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { MembersPage } from '@/pages/members/MembersPage'
import { MemberDetailPage } from '@/pages/members/MemberDetailPage'
import { ApplicationsPage } from '@/pages/applications/ApplicationsPage'
import { ApplicationDetailPage } from '@/pages/applications/ApplicationDetailPage'
import { RenewalsPage } from '@/pages/renewals/RenewalsPage'
import { CommitteesPage } from '@/pages/committees/CommitteesPage'
import { CommitteeDetailPage } from '@/pages/committees/CommitteeDetailPage'
import { EventsPage } from '@/pages/events/EventsPage'
import { EventDetailPage } from '@/pages/events/EventDetailPage'
import { RegistrationsPage } from '@/pages/registrations/RegistrationsPage'
import { RegistrationDetailPage } from '@/pages/registrations/RegistrationDetailPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000, refetchOnWindowFocus: false },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/members" element={<MembersPage />} />
              <Route path="/members/:id" element={<MemberDetailPage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route path="/applications/:id" element={<ApplicationDetailPage />} />
              <Route path="/renewals" element={<RenewalsPage />} />
              <Route path="/committees" element={<CommitteesPage />} />
              <Route path="/committees/:id" element={<CommitteeDetailPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/registrations" element={<RegistrationsPage />} />
              <Route path="/registrations/:id" element={<RegistrationDetailPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors closeButton />
      </AuthProvider>
    </QueryClientProvider>
  )
}
