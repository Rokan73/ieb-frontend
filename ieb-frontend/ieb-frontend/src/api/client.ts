import axios, { AxiosError } from 'axios'
import type { ApiResponse } from '@/types/api'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://fanciful-torrone-561891.netlify.app/api'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ieb_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiResponse>) => {
    if (error.response?.status === 401) {
      const isLogin = error.config?.url?.includes('/auth/login')
      if (!isLogin) {
        localStorage.removeItem('ieb_access_token')
        localStorage.removeItem('ieb_refresh_token')
        localStorage.removeItem('ieb_user')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiResponse | undefined
    if (data && !data.success && data.message) return data.message
    if (err.message === 'Network Error') return 'Network error. Please check your connection.'
    return err.message || 'Request failed'
  }
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

export default api
