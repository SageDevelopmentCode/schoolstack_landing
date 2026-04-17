interface BadgeProps {
  children: React.ReactNode
  className?: string
}

export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill bg-accent-soft text-accent text-[11px] font-medium uppercase tracking-widest px-3 py-1.5 ${className}`}
    >
      {children}
    </span>
  )
}
