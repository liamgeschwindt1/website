'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type CampaignStatus = 'Draft' | 'Scheduled' | 'Active' | 'Completed'

export interface Campaign {
  id: string
  name: string
  type: string[]
  persona: string
  startDate: string
  endDate: string
  goal: string
  description: string
  status: CampaignStatus
  tags: string[]
  metrics: { reach: number | null; clicks: number | null; signups: number | null }
  createdAt: string
}

export interface Persona {
  id: string
  name: string
  segment: string
  ageRange: string
  keyNeeds: string
  frustrations: string
  techComfort: 'Low' | 'Medium' | 'High'
  channels: string
  quote: string
  avatarColor: string
  campaigns: number
}

const SEED_CAMPAIGNS: Campaign[] = [
  {
    id: 'c1',
    name: 'Early Access Launch',
    type: ['Email', 'Social'],
    persona: 'p1',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    goal: '500 early access signups',
    description: 'Launch campaign targeting the BLV community for early access.',
    status: 'Draft',
    tags: ['Launch', 'Email', 'Social'],
    metrics: { reach: null, clicks: null, signups: null },
    createdAt: '2026-04-21',
  },
  {
    id: 'c2',
    name: 'O&M Instructor Outreach',
    type: ['Email'],
    persona: 'p2',
    startDate: '2026-07-15',
    endDate: '2026-08-15',
    goal: '50 instructor sign-ups',
    description: 'Targeted outreach to O&M instructors across the UK.',
    status: 'Scheduled',
    tags: ['B2B', 'Email'],
    metrics: { reach: null, clicks: null, signups: null },
    createdAt: '2026-04-21',
  },
  {
    id: 'c3',
    name: 'Blind Veterans UK — Joint Campaign',
    type: ['Partnership', 'Social'],
    persona: 'p1',
    startDate: '2026-04-21',
    endDate: '2026-06-21',
    goal: '300 awareness reach',
    description: 'Joint awareness campaign with Blind Veterans UK.',
    status: 'Active',
    tags: ['Partnership', 'Awareness'],
    metrics: { reach: null, clicks: null, signups: null },
    createdAt: '2026-04-21',
  },
]

const SEED_PERSONAS: Persona[] = [
  {
    id: 'p1',
    name: 'Alex',
    segment: 'BLV Community — End User',
    ageRange: '25–55',
    keyNeeds: 'Independence, confidence, safety in unfamiliar places',
    frustrations: 'Getting lost, over-reliance on others, inaccessible environments',
    techComfort: 'Medium',
    channels: 'WhatsApp, email, word of mouth',
    quote: 'I just want to get there without asking for help.',
    avatarColor: '#01B4AF',
    campaigns: 2,
  },
  {
    id: 'p2',
    name: 'Jacky',
    segment: 'O&M Instructors',
    ageRange: '30–60',
    keyNeeds: 'Professional tools, route verification, client tracking',
    frustrations: 'Manual processes, no digital tools, can\'t scale expertise',
    techComfort: 'High',
    channels: 'LinkedIn, professional associations, email',
    quote: 'My expertise shouldn\'t be locked inside a single session.',
    avatarColor: '#FFB100',
    campaigns: 1,
  },
  {
    id: 'p3',
    name: 'The Decision Maker',
    segment: 'Enterprise / Organisations',
    ageRange: '35–55',
    keyNeeds: 'ROI, compliance, staff burden reduction',
    frustrations: 'Integration complexity, proving value internally, procurement timelines',
    techComfort: 'Medium',
    channels: 'LinkedIn, direct outreach, case studies',
    quote: 'Show me the business case and I\'ll make it happen.',
    avatarColor: '#378ADD',
    campaigns: 1,
  },
]

interface CampaignContextValue {
  campaigns: Campaign[]
  personas: Persona[]
  addCampaign: (c: Campaign) => void
  updateCampaign: (id: string, changes: Partial<Campaign>) => void
  updateCampaignStatus: (id: string, status: CampaignStatus) => void
  addPersona: (p: Persona) => void
  updatePersona: (id: string, changes: Partial<Persona>) => void
}

const CampaignContext = createContext<CampaignContextValue | null>(null)

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(SEED_CAMPAIGNS)
  const [personas, setPersonas] = useState<Persona[]>(SEED_PERSONAS)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const sc = localStorage.getItem('tp_campaigns_v1')
      const sp = localStorage.getItem('tp_personas_v1')
      if (sc) setCampaigns(JSON.parse(sc))
      if (sp) setPersonas(JSON.parse(sp))
    } catch {
      // ignore
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem('tp_campaigns_v1', JSON.stringify(campaigns))
  }, [campaigns, hydrated])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem('tp_personas_v1', JSON.stringify(personas))
  }, [personas, hydrated])

  const addCampaign = (c: Campaign) => setCampaigns(prev => [c, ...prev])
  const updateCampaign = (id: string, changes: Partial<Campaign>) =>
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...changes } : c))
  const updateCampaignStatus = (id: string, status: CampaignStatus) =>
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status } : c))
  const addPersona = (p: Persona) => setPersonas(prev => [...prev, p])
  const updatePersona = (id: string, changes: Partial<Persona>) =>
    setPersonas(prev => prev.map(p => p.id === id ? { ...p, ...changes } : p))

  return (
    <CampaignContext.Provider value={{ campaigns, personas, addCampaign, updateCampaign, updateCampaignStatus, addPersona, updatePersona }}>
      {children}
    </CampaignContext.Provider>
  )
}

export function useCampaigns() {
  const ctx = useContext(CampaignContext)
  if (!ctx) throw new Error('useCampaigns must be used inside CampaignProvider')
  return ctx
}
