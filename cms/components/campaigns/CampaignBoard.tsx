'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import { Campaign, CampaignStatus, Persona } from '@/context/CampaignContext'
import CampaignCard from './CampaignCard'
import { useToast } from '@/components/Toast'

const COLUMNS: CampaignStatus[] = ['Draft', 'Scheduled', 'Active', 'Completed']

function DroppableColumn({
  status,
  campaigns,
  personas,
  onEdit,
  onDuplicate,
  onArchive,
  onAdd,
}: {
  status: CampaignStatus
  campaigns: Campaign[]
  personas: Persona[]
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onArchive: (id: string) => void
  onAdd: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      style={{
        background: 'rgba(27,53,79,0.25)',
        border: `0.5px solid ${isOver ? 'rgba(1,180,175,0.50)' : 'rgba(255,255,255,0.08)'}`,
        backgroundColor: isOver ? 'rgba(1,180,175,0.04)' : undefined,
        borderRadius: 12,
        padding: 16,
        minHeight: 400,
        transition: 'border-color 150ms, background-color 150ms',
      }}
      className="flex flex-col"
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>{status}</span>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--muted)' }}>
          {campaigns.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3 flex-1">
        {campaigns.map(c => (
          <CampaignCard
            key={c.id}
            campaign={c}
            personas={personas}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onArchive={onArchive}
          />
        ))}
      </div>

      {/* Add link */}
      <button
        type="button"
        onClick={onAdd}
        className="mt-4 text-[12px] text-center w-full py-1.5 rounded-[6px] transition-colors hover:bg-white/5"
        style={{ color: 'var(--muted)' }}
      >
        + Add
      </button>
    </div>
  )
}

interface Props {
  campaigns: Campaign[]
  personas: Persona[]
  updateCampaignStatus: (id: string, status: CampaignStatus) => void
  onAdd: () => void
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onArchive: (id: string) => void
}

export default function CampaignBoard({ campaigns, personas, updateCampaignStatus, onAdd, onEdit, onDuplicate, onArchive }: Props) {
  const { showToast } = useToast()
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over) return
    const campaignId = active.id as string
    const newStatus = over.id as CampaignStatus
    const campaign = campaigns.find(c => c.id === campaignId)
    if (!campaign || campaign.status === newStatus) return
    updateCampaignStatus(campaignId, newStatus)
    showToast(`Campaign moved to ${newStatus}`)
  }

  const activeCampaign = campaigns.find(c => c.id === activeId)

  return (
    <DndContext
      sensors={sensors}
      onDragStart={e => setActiveId(e.active.id as string)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map(status => (
          <DroppableColumn
            key={status}
            status={status}
            campaigns={campaigns.filter(c => c.status === status)}
            personas={personas}
            onAdd={onAdd}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onArchive={onArchive}
          />
        ))}
      </div>
      <DragOverlay>
        {activeCampaign && (
          <div style={{ opacity: 0.5, transform: 'rotate(1.5deg)' }}>
            <CampaignCard campaign={activeCampaign} personas={personas} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
