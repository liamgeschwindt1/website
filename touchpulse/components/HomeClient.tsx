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
import type { SiteCopy } from '@/lib/cms'

interface Props {
  siteCopy: SiteCopy
  footerDescription: string
}

export default function HomeClient({ siteCopy, footerDescription }: Props) {
  const [defaultMessage, setDefaultMessage] = useState('')

  return (
    <>
      <Nav />
      <main>
        <Hero copy={siteCopy.hero} />
        <ProofBar proofBar={siteCopy.proofBar} />
        <Features />
        <GetInvolved onSetMessage={setDefaultMessage} />
        <CTABanner copy={siteCopy.ctaBanner} onSetMessage={setDefaultMessage} />
        <ContactForm defaultMessage={defaultMessage} />
      </main>
      <Footer description={footerDescription} />
    </>
  )
}
