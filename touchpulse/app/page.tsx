import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import ProofBar from '@/components/ProofBar'
import StorySection from '@/components/StorySection'
import Features from '@/components/Features'
import HumanRow from '@/components/HumanRow'
import AISection from '@/components/AISection'
import UseCases from '@/components/UseCases'
import Pricing from '@/components/Pricing'
import CTABanner from '@/components/CTABanner'
import ContactForm from '@/components/ContactForm'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ProofBar />
        <StorySection />
        <Features />
        <HumanRow />
        <AISection />
        <UseCases />
        <Pricing />
        <CTABanner />
        <ContactForm />
      </main>
      <Footer />
    </>
  )
}
