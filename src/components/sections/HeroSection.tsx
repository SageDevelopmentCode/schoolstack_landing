import dynamic from 'next/dynamic'
import Image from 'next/image'
import { DemoSkeleton } from '@/components/ui/DemoSkeleton'

const HeroDemoSection = dynamic(
  () => import('@/components/sections/HeroDemoSection'),
  {
    loading: () => (
      <div
        className="hero-frame-enter relative mt-14 lg:max-w-[1100px] lg:mx-auto"
        style={{ height: 510 }}
      >
        <DemoSkeleton className="h-full rounded-t-xl" />
      </div>
    ),
  },
)

export default function HeroSection() {
  return (
    <section
      className="overflow-x-visible overflow-y-hidden bg-[#F7F1E7] pt-[140px] pb-0 lg:overflow-hidden"
    >
      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-16">
        <div className="hero-enter-slide-right pointer-events-none absolute top-[-20px] right-[-200px] z-0 hidden select-none lg:block">
          <Image
            src="/images/illustrations/HeroRight.webp"
            alt=""
            aria-hidden="true"
            width={480}
            height={580}
            loading="lazy"
            sizes="480px"
          />
        </div>

        <div className="hero-enter-slide-left pointer-events-none absolute top-[-20px] left-[-200px] z-0 hidden select-none lg:block">
          <Image
            src="/images/illustrations/HeroLeft.webp"
            alt=""
            aria-hidden="true"
            width={480}
            height={580}
            loading="lazy"
            sizes="480px"
          />
        </div>

        <div className="mx-auto max-w-[680px] text-center">
          <div className="hero-enter" style={{ '--hero-delay': '0ms' } as React.CSSProperties}>
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-[#E2EDD9] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[#4A6B52]">
              🌿 Built for Microschools
            </span>
          </div>

          <h1 className="font-display mt-6 text-[clamp(2.6rem,5.2vw,4.75rem)] font-medium leading-[1.04] tracking-tight text-[#2E4A3C]">
            Everything your microschool needs,
            <br />
            <em className="text-clay" style={{ fontStyle: 'italic' }}>
              all in one place.
            </em>
          </h1>

          <p className="mt-6 text-[17px] leading-relaxed text-[#2E4A3C]/80 md:text-[18px]">
            MudKitchen keeps parents, teachers, and administrators aligned with enrollment, communication, billing, and more&mdash;so you can focus on what matters most: your students.
          </p>

          <div className="hero-enter mt-8 flex items-center justify-center gap-4" style={{ '--hero-delay': '280ms' } as React.CSSProperties}>
            <a
              href="/get-started"
              className="font-secondary inline-flex h-11 items-center gap-2 rounded-pill bg-clay px-7 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90"
            >
              Book a Demo
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2.5 7H11.5M11.5 7L7.5 3M11.5 7L7.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a
              href="#product"
              className="font-secondary hidden items-center gap-1.5 text-sm text-[#2E4A3C]/50 transition-colors duration-500 hover:text-[#2E4A3C]/80 lg:inline-flex"
            >
              Try the product
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 2.5V11.5M7 11.5L3 7.5M7 11.5L11 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>

        <HeroDemoSection />
      </div>
    </section>
  )
}
