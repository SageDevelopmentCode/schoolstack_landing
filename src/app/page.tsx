import dynamic from 'next/dynamic'
import Navbar from '@/components/sections/Navbar'
import HeroSection from '@/components/sections/HeroSection'
import ProductPreviewSkeleton from '@/components/sections/ProductPreviewSkeleton'
import SectionFallback from '@/components/ui/SectionFallback'
import { DeferredSection } from '@/components/ui/DeferredSection'

const ProductPreviewSection = dynamic(
  () => import('@/components/sections/ProductPreviewSection'),
  { loading: () => <ProductPreviewSkeleton /> }
)

const PainSection = dynamic(
  () => import('@/components/sections/PainSection'),
  { loading: () => <SectionFallback minHeight="28rem" /> }
)
const FamilyClaritySection = dynamic(
  () => import('@/components/sections/FamilyClaritySection'),
  { loading: () => <SectionFallback minHeight="24rem" /> }
)
const AdminGrowthSection = dynamic(
  () => import('@/components/sections/AdminGrowthSection'),
  { loading: () => <SectionFallback minHeight="24rem" /> }
)
const TeacherSupportSection = dynamic(
  () => import('@/components/sections/TeacherSupportSection'),
  { loading: () => <SectionFallback minHeight="24rem" /> }
)
const WorkflowSection = dynamic(
  () => import('@/components/sections/WorkflowSection'),
  { loading: () => <SectionFallback minHeight="32rem" /> }
)
const StacksSection = dynamic(
  () => import('@/components/sections/StacksSection'),
  { loading: () => <SectionFallback minHeight="20rem" /> }
)
const FounderStorySection = dynamic(
  () => import('@/components/sections/FounderStorySection'),
  { loading: () => <SectionFallback minHeight="28rem" /> }
)
const CustomSection = dynamic(
  () => import('@/components/sections/CustomSection'),
  { loading: () => <SectionFallback minHeight="20rem" /> }
)
const FinalCTASection = dynamic(
  () => import('@/components/sections/FinalCTASection'),
  { loading: () => <SectionFallback minHeight="16rem" /> }
)
const Footer = dynamic(
  () => import('@/components/sections/Footer'),
  { loading: () => <SectionFallback minHeight="12rem" /> }
)
const FloatingQuestionButton = dynamic(
  () => import('@/components/sections/FloatingQuestionButton'),
  { loading: () => null }
)

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <DeferredSection fallback={<ProductPreviewSkeleton />}>
          <ProductPreviewSection />
        </DeferredSection>
        <DeferredSection minHeight="28rem">
          <PainSection />
        </DeferredSection>
        <DeferredSection minHeight="24rem">
          <FamilyClaritySection />
        </DeferredSection>
        <DeferredSection minHeight="24rem">
          <AdminGrowthSection />
        </DeferredSection>
        <DeferredSection minHeight="24rem">
          <TeacherSupportSection />
        </DeferredSection>
        {/* <RightSizedSection /> */}
        <DeferredSection minHeight="32rem">
          <WorkflowSection />
        </DeferredSection>
        <DeferredSection minHeight="20rem">
          <StacksSection />
        </DeferredSection>
        {/* <MicroschoolsSection /> */}
        <DeferredSection minHeight="28rem">
          <FounderStorySection />
        </DeferredSection>
        <DeferredSection minHeight="20rem">
          <CustomSection />
        </DeferredSection>
        <DeferredSection minHeight="16rem">
          <FinalCTASection />
        </DeferredSection>
      </main>
      <DeferredSection minHeight="12rem">
        <Footer />
      </DeferredSection>
      <DeferredSection minHeight="0" fallback={null}>
        <FloatingQuestionButton />
      </DeferredSection>
    </>
  )
}
