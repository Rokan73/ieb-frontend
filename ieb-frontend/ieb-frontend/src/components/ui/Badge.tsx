import { cn, statusColor, titleCase } from '@/lib/utils'

export function Badge({ status, className }: { status?: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        statusColor(status),
        className
      )}
    >
      {titleCase(status)}
    </span>
  )
}
