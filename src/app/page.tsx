import dynamic from 'next/dynamic'
import Navbar from '@/components/sections/Navbar'
import HeroSection from '@/components/sections/HeroSection'
import ProductPreviewSkeleton from '@/components/sections/ProductPreviewSkeleton'
import SectionFallback from '@/components/ui/SectionFallback'

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
        <ProductPreviewSection />
        <PainSection />
        <FamilyClaritySection />
        <AdminGrowthSection />
        <TeacherSupportSection />
        {/* <RightSizedSection /> */}
        <WorkflowSection />
        <StacksSection />
        {/* <MicroschoolsSection /> */}
        <FounderStorySection />
        <CustomSection />
        <FinalCTASection />
      </main>
      <Footer />
      <FloatingQuestionButton />
    </>
  )
}
