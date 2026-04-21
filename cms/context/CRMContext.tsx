'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

// ─── Types ─────────────────────────────────────────────────────────────────

export type Segment = 'BLV Community' | 'Instructor' | 'Enterprise' | 'Champion' | 'General'

export type Contact = {
  id: string
  name: string
  email: string
  phone?: string
  segment: Segment
  persona?: string
  health: number
  lastContactedDate: string // ISO string
  social: number    // 0-100 Sims need
  energy: number    // 0-100 Sims need
  hygiene: number   // 0-100 Sims need
  fun: number       // 0-100 Sims need
  activityLog: ActivityEntry[]
  notes?: string
}

export type ActivityEntry = {
  id: string
  type: 'Call' | 'Email' | 'Note' | 'Import'
  timestamp: string
  description: string
}

export type ToastMessage = {
  id: string
  text: string
  type: 'success' | 'error' | 'info'
}

// ─── Context Shape ──────────────────────────────────────────────────────────

type CRMContextType = {
  contacts: Contact[]
  toasts: ToastMessage[]
  importContacts: (newContacts: Omit<Contact, 'id' | 'health' | 'lastContactedDate' | 'social' | 'energy' | 'hygiene' | 'fun' | 'activityLog'>[]) => { added: number; skipped: number }
  updateContact: (id: string, updates: Partial<Contact>) => void
  deleteContacts: (ids: string[]) => void
  logTouchPoint: (id: string, type: ActivityEntry['type'], description: string) => void
  addToast: (text: string, type?: ToastMessage['type']) => void
  removeToast: (id: string) => void
}

const CRMContext = createContext<CRMContextType | null>(null)

// ─── Seed Data ──────────────────────────────────────────────────────────────

const SEED_CONTACTS: Contact[] = [
  {
    id: 'seed-1',
    name: 'Alex',
    email: 'alex@blvcommunity.org',
    phone: '+1 555 0101',
    segment: 'BLV Community',
    persona: 'Alex',
    health: 88,
    lastContactedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    social: 85,
    energy: 80,
    hygiene: 90,
    fun: 75,
    activityLog: [
      { id: 'al-1', type: 'Call', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), description: 'Intro call — very engaged.' },
      { id: 'al-2', type: 'Email', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), description: 'Sent onboarding resources.' },
    ],
  },
  {
    id: 'seed-2',
    name: 'Jacky',
    email: 'jacky@instructor.edu',
    phone: '+1 555 0202',
    segment: 'Instructor',
    persona: 'Jacky',
    health: 52,
    lastContactedDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    social: 55,
    energy: 45,
    hygiene: 70,
    fun: 50,
    activityLog: [
      { id: 'jl-1', type: 'Email', timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), description: 'Follow-up on training module.' },
    ],
  },
  {
    id: 'seed-3',
    name: 'The Decision Maker',
    email: 'dm@enterprise.com',
    phone: '+1 555 0303',
    segment: 'Enterprise',
    persona: 'Decision Maker',
    health: 14,
    lastContactedDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    social: 20,
    energy: 15,
    hygiene: 35,
    fun: 10,
    activityLog: [
      { id: 'dm-1', type: 'Call', timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), description: 'Demo call — awaiting budget approval.' },
    ],
  },
]

const STORAGE_KEY = 'tp_crm_v1'
const DAILY_DECAY_RATE = 5      // points lost per day without contact
const INITIAL_CONTACT_SCORE = 60 // starting score for all imported contacts

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function loadFromStorage(): Contact[] {
  if (typeof window === 'undefined') return SEED_CONTACTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return SEED_CONTACTS
    return JSON.parse(raw)
  } catch {
    return SEED_CONTACTS
  }
}

function saveToStorage(contacts: Contact[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts))
}

// ─── Health Decay ───────────────────────────────────────────────────────────

function applyDecay(contacts: Contact[]): Contact[] {
  const now = Date.now()
  return contacts.map((c) => {
    const lastMs = new Date(c.lastContactedDate).getTime()
    const daysPassed = Math.floor((now - lastMs) / (24 * 60 * 60 * 1000))
    const decayed = Math.max(0, c.health - daysPassed * DAILY_DECAY_RATE)
    return decayed !== c.health ? { ...c, health: decayed } : c
  })
}

// ─── Provider ───────────────────────────────────────────────────────────────

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  // Hydrate from localStorage and apply decay on mount
  useEffect(() => {
    const stored = loadFromStorage()
    const decayed = applyDecay(stored)
    setContacts(decayed)
    saveToStorage(decayed)
  }, [])

  const addToast = useCallback((text: string, type: ToastMessage['type'] = 'success') => {
    const id = uid()
    setToasts((prev) => [...prev, { id, text, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const importContacts = useCallback(
    (raw: Omit<Contact, 'id' | 'health' | 'lastContactedDate' | 'social' | 'energy' | 'hygiene' | 'fun' | 'activityLog'>[]) => {
      let added = 0
      let skipped = 0

      setContacts((prev) => {
        const existingEmails = new Set(prev.map((c) => c.email.toLowerCase()))
        const newContacts: Contact[] = []

        for (const raw_c of raw) {
          if (existingEmails.has(raw_c.email.toLowerCase())) {
            skipped++
          } else {
            existingEmails.add(raw_c.email.toLowerCase())
            added++
            newContacts.push({
              ...raw_c,
              id: uid(),
              health: INITIAL_CONTACT_SCORE,
              lastContactedDate: new Date().toISOString(),
              social: INITIAL_CONTACT_SCORE,
              energy: INITIAL_CONTACT_SCORE,
              hygiene: INITIAL_CONTACT_SCORE,
              fun: INITIAL_CONTACT_SCORE,
              activityLog: [
                {
                  id: uid(),
                  type: 'Import',
                  timestamp: new Date().toISOString(),
                  description: 'Contact imported via Smart Importer.',
                },
              ],
            })
          }
        }

        const updated = [...prev, ...newContacts]
        saveToStorage(updated)
        return updated
      })

      return { added, skipped }
    },
    []
  )

  const updateContact = useCallback((id: string, updates: Partial<Contact>) => {
    setContacts((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      saveToStorage(updated)
      return updated
    })
  }, [])

  const deleteContacts = useCallback((ids: string[]) => {
    const idSet = new Set(ids)
    setContacts((prev) => {
      const updated = prev.filter((c) => !idSet.has(c.id))
      saveToStorage(updated)
      return updated
    })
  }, [])

  const logTouchPoint = useCallback(
    (id: string, type: ActivityEntry['type'], description: string) => {
      const entry: ActivityEntry = {
        id: uid(),
        type,
        timestamp: new Date().toISOString(),
        description,
      }
      setContacts((prev) => {
        const updated = prev.map((c) => {
          if (c.id !== id) return c
          const restored = { ...c, health: 100, lastContactedDate: new Date().toISOString(), activityLog: [entry, ...c.activityLog] }
          return restored
        })
        saveToStorage(updated)
        return updated
      })

      const contact = contacts.find((c) => c.id === id)
      if (contact) {
        addToast(`${contact.name}'s health restored to 100%!`)
      }
    },
    [contacts, addToast]
  )

  return (
    <CRMContext.Provider value={{ contacts, toasts, importContacts, updateContact, deleteContacts, logTouchPoint, addToast, removeToast }}>
      {children}
    </CRMContext.Provider>
  )
}

export function useCRM() {
  const ctx = useContext(CRMContext)
  if (!ctx) throw new Error('useCRM must be used within CRMProvider')
  return ctx
}

// ─── Health Helpers ─────────────────────────────────────────────────────────

export function healthState(score: number): 'thriving' | 'neglected' | 'critical' | 'warning' {
  if (score >= 80) return 'thriving'
  if (score >= 40) return 'neglected'
  if (score >= 20) return 'warning'
  return 'critical'
}

export function healthColor(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 40) return '#FFB100'
  if (score >= 20) return '#f97316'
  return '#DC2626'
}
