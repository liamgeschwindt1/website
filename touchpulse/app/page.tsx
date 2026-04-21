'use client'

import { useState } from 'react'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import ProofBar from '@/components/ProofBar'
import Features from '@/components/Features'
import GetInvolved from '@/components/GetInvolved'
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
        <GetInvolved onSetMessage={setDefaultMessage} />
        <CTABanner onSetMessage={setDefaultMessage} />
        <ContactForm defaultMessage={defaultMessage} />
      </main>
      <Footer />
    </>
  )
}

