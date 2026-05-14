import Navbar from '@/components/sections/Navbar'
import Footer from '@/components/sections/Footer'
import SagefieldHero from '@/components/sections/customers/sagefield/SagefieldHero'
import SagefieldChallenge from '@/components/sections/customers/sagefield/SagefieldChallenge'
import SagefieldTimeline from '@/components/sections/customers/sagefield/SagefieldTimeline'
import SagefieldOutcomes from '@/components/sections/customers/sagefield/SagefieldOutcomes'
import SagefieldBeforeAfter from '@/components/sections/customers/sagefield/SagefieldBeforeAfter'
import SagefieldWhyItWorked from '@/components/sections/customers/sagefield/SagefieldWhyItWorked'
import SagefieldBuyerRelevance from '@/components/sections/customers/sagefield/SagefieldBuyerRelevance'
import SagefieldStickyRail from '@/components/sections/customers/sagefield/SagefieldStickyRail'

export const metadata = {
  title: 'Sage Field Case Study — MudKitchen',
  description:
    'How Sage Field launched and grew from 0 to 25 students in under 3 months using MudKitchen to power their website, enrollment, tuition, and operations.',
}

export default function SagefieldPage() {
  return (
    <>
      <Navbar />
      <main>
        <SagefieldHero />
        <SagefieldChallenge />
        <SagefieldTimeline />
        <SagefieldOutcomes />
        <SagefieldBeforeAfter />
        <SagefieldWhyItWorked />
        <SagefieldBuyerRelevance />
      </main>
      <Footer />
      <SagefieldStickyRail />
    </>
  )
}
