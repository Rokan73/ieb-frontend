import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date?: string | null) {
  if (!date) return '—'
  try {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

export function formatCurrency(amount?: number | string | null) {
  if (amount === null || amount === undefined) return '—'
  const n = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(n)) return '—'
  return `৳${n.toLocaleString('en-BD')}`
}

export function statusColor(status?: string) {
  const s = (status || '').toLowerCase()
  if (['active', 'approved', 'completed', 'attended', 'published', 'registration_open'].includes(s))
    return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (['pending', 'submitted', 'under_review', 'draft', 'payment_pending', 'query'].includes(s))
    return 'bg-amber-50 text-amber-700 border-amber-200'
  if (['rejected', 'cancelled', 'expired', 'suspended', 'deceased'].includes(s))
    return 'bg-red-50 text-red-700 border-red-200'
  if (['ongoing', 'verified', 'recommended'].includes(s))
    return 'bg-blue-50 text-blue-700 border-blue-200'
  return 'bg-slate-50 text-slate-600 border-slate-200'
}

export function titleCase(str?: string) {
  if (!str) return '—'
  return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
