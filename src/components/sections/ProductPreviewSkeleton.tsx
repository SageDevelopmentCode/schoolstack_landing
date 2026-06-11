export default function ProductPreviewSkeleton() {
  return (
    <section id="product" className="relative overflow-hidden bg-surface py-24">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-16">
        <div className="max-w-[720px] mx-auto text-center mb-16 space-y-5">
          <div className="h-7 w-44 bg-gray-200 rounded-full mx-auto animate-pulse" />
          <div className="h-10 w-full max-w-lg bg-gray-100 rounded-lg mx-auto animate-pulse" />
          <div className="h-20 w-full max-w-xl bg-gray-50 rounded-lg mx-auto animate-pulse border border-gray-100" />
        </div>
        <div className="h-12 w-full max-w-2xl bg-gray-100 rounded-xl mx-auto animate-pulse" />
        <div className="mt-6 w-full h-[300px] lg:h-[700px] rounded-xl bg-gray-50 border border-gray-200 animate-pulse" />
      </div>
    </section>
  )
}
