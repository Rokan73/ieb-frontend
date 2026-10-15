import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { login as apiLogin, getMe, logout as apiLogout } from '@/api/endpoints'
import type { AuthUser } from '@/types/api'
import { getErrorMessage } from '@/api/client'

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  hasRole: (...roles: string[]) => boolean
  hasPermission: (perm: string) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem('ieb_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('ieb_access_token')
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const t = localStorage.getItem('ieb_access_token')
    if (!t) {
      setIsLoading(false)
      return
    }
    getMe()
      .then((u) => {
        setUser(u)
        localStorage.setItem('ieb_user', JSON.stringify(u))
      })
      .catch(() => {
        localStorage.removeItem('ieb_access_token')
        localStorage.removeItem('ieb_refresh_token')
        localStorage.removeItem('ieb_user')
        setUser(null)
        setToken(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password)
    localStorage.setItem('ieb_access_token', res.accessToken)
    localStorage.setItem('ieb_refresh_token', res.refreshToken)
    localStorage.setItem('ieb_user', JSON.stringify(res.user))
    setToken(res.accessToken)
    setUser(res.user)
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } finally {
      localStorage.removeItem('ieb_access_token')
      localStorage.removeItem('ieb_refresh_token')
      localStorage.removeItem('ieb_user')
      setToken(null)
      setUser(null)
    }
  }, [])

  const hasRole = useCallback(
    (...roles: string[]) => {
      if (!user) return false
      if (user.roles.includes('super_admin')) return true
      return roles.some((r) => user.roles.includes(r))
    },
    [user]
  )

  const hasPermission = useCallback(
    (perm: string) => {
      if (!user) return false
      if (user.roles.includes('super_admin') || user.permissions.includes('*')) return true
      return user.permissions.includes(perm)
    },
    [user]
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export { getErrorMessage }
