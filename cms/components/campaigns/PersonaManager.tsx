'use client'

import { Persona } from '@/context/CampaignContext'
import PersonaCard from './PersonaCard'
import PersonaFormModal from './PersonaFormModal'
import { useState } from 'react'

interface Props {
  personas: Persona[]
  onAdd: (p: Persona) => void
  onUpdate: (id: string, changes: Partial<Persona>) => void
  campaignCounts: Record<string, number>
}

export default function PersonaManager({ personas, onAdd, campaignCounts }: Props) {
  const [showModal, setShowModal] = useState(false)

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {personas.map(p => (
          <PersonaCard key={p.id} persona={p} campaignCount={campaignCounts[p.id] ?? 0} />
        ))}
      </div>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="px-4 py-2 rounded-[6px] text-[13px] font-medium border transition-colors hover:bg-white/5"
        style={{ borderColor: 'var(--teal)', color: 'var(--teal)', background: 'transparent' }}
      >
        + New persona
      </button>
      {showModal && (
        <PersonaFormModal
          onSubmit={p => { onAdd(p); setShowModal(false) }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
