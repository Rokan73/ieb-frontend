import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth, getErrorMessage } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { Shield } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof schema>

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: 'admin@ieb-demo.local', password: 'ChangeMe123!' },
  })

  if (isAuthenticated) {
    navigate(from, { replace: true })
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await login(data.email, data.password)
      toast.success('Login successful')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-navy-950 p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">
            IEB
          </div>
          <div>
            <p className="text-lg font-semibold text-white">Institution of Engineers</p>
            <p className="text-sm text-navy-400">Bangladesh</p>
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white leading-tight">
            Membership & Professional
            <br />
            Management System
          </h1>
          <p className="mt-4 max-w-md text-navy-300">
            Secure administrative portal for members, applications, committees, events and
            professional registration.
          </p>
        </div>
        <p className="text-xs text-navy-500">© {new Date().getFullYear()} IEB · Demo Environment</p>
      </div>

      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-900 text-sm font-bold text-white">
              IEB
            </div>
            <span className="font-semibold text-slate-900">IEB Admin</span>
          </div>

          <div className="mb-8">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              <Shield className="h-3.5 w-3.5" />
              Secure Login
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Sign in to your account</h2>
            <p className="mt-1 text-sm text-slate-500">
              Use your IEB administrative credentials
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              id="email"
              label="Email address"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign in
            </Button>
          </form>

          <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-600">Demo credentials</p>
            <p className="mt-1 text-xs text-slate-500">
              admin@ieb-demo.local / ChangeMe123!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
