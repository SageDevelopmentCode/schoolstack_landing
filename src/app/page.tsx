import Navbar from '@/components/sections/Navbar'
import HeroSection from '@/components/sections/HeroSection'
import PainSection from '@/components/sections/PainSection'
import FounderStorySection from '@/components/sections/FounderStorySection'
import ProductPreviewSection from '@/components/sections/ProductPreviewSection'
import WorkflowSection from '@/components/sections/WorkflowSection'
import StacksSection from '@/components/sections/StacksSection'
import MicroschoolsSection from '@/components/sections/MicroschoolsSection'
import CustomSection from '@/components/sections/CustomSection'
import FinalCTASection from '@/components/sections/FinalCTASection'
import Footer from '@/components/sections/Footer'
import FloatingQuestionButton from '@/components/sections/FloatingQuestionButton'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <PainSection />
        <ProductPreviewSection />
        <WorkflowSection />
        <StacksSection />
        <MicroschoolsSection />
        <FounderStorySection />
        <CustomSection />
        <FinalCTASection />
      </main>
      <Footer />
      <FloatingQuestionButton />
    </>
  )
}
