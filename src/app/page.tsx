import Navbar from '@/components/sections/Navbar'
import HeroSection from '@/components/sections/HeroSection'
import PainSection from '@/components/sections/PainSection'
import FounderStoryBridgeSection from '@/components/sections/FounderStoryBridgeSection'
import ProductPreviewSection from '@/components/sections/ProductPreviewSection'
import WorkflowSection from '@/components/sections/WorkflowSection'
import StacksSection from '@/components/sections/StacksSection'
import MicroschoolsSection from '@/components/sections/MicroschoolsSection'
import ProofSection from '@/components/sections/ProofSection'
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
        <FounderStoryBridgeSection />
        <ProductPreviewSection />
        <WorkflowSection />
        <StacksSection />
        <MicroschoolsSection />
        <ProofSection />
        <CustomSection />
        <FinalCTASection />
      </main>
      <Footer />
      <FloatingQuestionButton />
    </>
  )
}
