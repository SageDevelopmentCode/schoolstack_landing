interface SectionFallbackProps {
  minHeight?: string
}

export default function SectionFallback({ minHeight = '16rem' }: SectionFallbackProps) {
  return (
    <div
      aria-hidden="true"
      className="w-full animate-pulse bg-gray-50/60"
      style={{ minHeight }}
    />
  )
}
