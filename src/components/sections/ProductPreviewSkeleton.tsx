export default function ProductPreviewSkeleton() {
  return (
    <section id="product" className="relative overflow-hidden bg-surface py-24">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-16">
        <div className="max-w-[720px] mx-auto text-center mb-16 space-y-5">
          <div className="h-7 w-44 bg-border/50 rounded-full mx-auto animate-pulse" />
          <div className="h-10 w-full max-w-lg bg-border/40 rounded-lg mx-auto animate-pulse" />
          <div className="h-20 w-full max-w-xl bg-border/30 rounded-lg mx-auto animate-pulse" />
        </div>
        <div className="h-12 w-full max-w-2xl bg-border/40 rounded-xl mx-auto animate-pulse" />
        <div className="mt-6 w-full h-[420px] md:h-[600px] lg:h-[700px] rounded-xl bg-surface-muted border border-border animate-pulse" />
      </div>
    </section>
  )
}
