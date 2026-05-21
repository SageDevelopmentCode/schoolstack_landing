import dynamic from 'next/dynamic'
import Navbar from '@/components/sections/Navbar'
import HeroSection from '@/components/sections/HeroSection'
import ProductPreviewSkeleton from '@/components/sections/ProductPreviewSkeleton'

const ProductPreviewSection = dynamic(
  () => import('@/components/sections/ProductPreviewSection'),
  { loading: () => <ProductPreviewSkeleton /> }
)

const PainSection = dynamic(() => import('@/components/sections/PainSection'))
const FamilyClaritySection = dynamic(() => import('@/components/sections/FamilyClaritySection'))
const AdminGrowthSection = dynamic(() => import('@/components/sections/AdminGrowthSection'))
const TeacherSupportSection = dynamic(() => import('@/components/sections/TeacherSupportSection'))
const WorkflowSection = dynamic(() => import('@/components/sections/WorkflowSection'))
const StacksSection = dynamic(() => import('@/components/sections/StacksSection'))
const FounderStorySection = dynamic(() => import('@/components/sections/FounderStorySection'))
const CustomSection = dynamic(() => import('@/components/sections/CustomSection'))
const FinalCTASection = dynamic(() => import('@/components/sections/FinalCTASection'))
const Footer = dynamic(() => import('@/components/sections/Footer'))
const FloatingQuestionButton = dynamic(() => import('@/components/sections/FloatingQuestionButton'))

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
