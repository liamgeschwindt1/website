'use client'

import { useState } from 'react'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import ProofBar from '@/components/ProofBar'
import Features from '@/components/Features'
import HumanRow from '@/components/HumanRow'
import AISection from '@/components/AISection'
import GetInvolved from '@/components/GetInvolved'
import UseCases from '@/components/UseCases'
import Pricing from '@/components/Pricing'
import CTABanner from '@/components/CTABanner'
import ContactForm from '@/components/ContactForm'
import Footer from '@/components/Footer'

export default function Home() {
  const [defaultMessage, setDefaultMessage] = useState('')

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ProofBar />
        <Features />
        <div aria-hidden="true" className="mx-[clamp(24px,5vw,80px)] h-px bg-[rgba(1,180,175,0.20)]" />
        <HumanRow />
        <AISection />
        <GetInvolved onSetMessage={setDefaultMessage} />
        <UseCases />
        <Pricing />
        <CTABanner onSetMessage={setDefaultMessage} />
        <ContactForm defaultMessage={defaultMessage} />
      </main>
      <Footer />
    </>
  )
}

