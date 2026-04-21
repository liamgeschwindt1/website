'use client'

import React, { useState, useCallback, useRef } from 'react'
import Papa from 'papaparse'
import { useCRM, Segment } from '@/context/CRMContext'

// ─── CRM Fields ──────────────────────────────────────────────────────────────

const CRM_FIELDS = [
  { key: 'name', label: 'Name', required: true },
  { key: 'email', label: 'Email', required: true },
  { key: 'phone', label: 'Phone', required: false },
  { key: 'segment', label: 'Segment', required: false },
  { key: 'persona', label: 'Persona', required: false },
  { key: '_skip', label: '— Skip —', required: false },
] as const

type CRMFieldKey = (typeof CRM_FIELDS)[number]['key']

// ─── Auto-match logic ────────────────────────────────────────────────────────

function autoMatch(header: string): CRMFieldKey {
  const h = header.toLowerCase().replace(/[\s_\-]/g, '')
  if (['name', 'fullname', 'contactname', 'firstname'].some((k) => h.includes(k))) return 'name'
  if (['email', 'emailaddress', 'workemail', 'mail'].some((k) => h.includes(k))) return 'email'
  if (['phone', 'tel', 'telephone', 'mobile', 'cell'].some((k) => h.includes(k))) return 'phone'
  if (['segment', 'group', 'category', 'tag'].some((k) => h.includes(k))) return 'segment'
  if (['persona', 'type', 'role'].some((k) => h.includes(k))) return 'persona'
  return '_skip'
}

// ─── Email validation ─────────────────────────────────────────────────────────

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

// ─── CSV Template download ────────────────────────────────────────────────────

function downloadTemplate() {
  const csv = 'Name,Email,Phone,Segment,Persona\nJane Doe,jane@example.com,+1 555 0100,General,\n'
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'touchpulse-crm-template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Step types ───────────────────────────────────────────────────────────────

type Step = 'upload' | 'mapping' | 'validation'

interface ParsedData {
  headers: string[]
  rows: Record<string, string>[]
}

interface ImportWizardProps {
  onClose: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImportWizard({ onClose }: ImportWizardProps) {
  const { importContacts, addToast } = useCRM()
  const [step, setStep] = useState<Step>('upload')
  const [parsed, setParsed] = useState<ParsedData | null>(null)
  const [mapping, setMapping] = useState<Record<string, CRMFieldKey>>({})
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // ── Validation state ──────────────────────────────────────────────────────
  interface ValidationRow {
    row: Record<string, string>
    mapped: Record<string, string>
    issues: string[]
  }
  const [validatedRows, setValidatedRows] = useState<ValidationRow[]>([])
  const [dupCount, setDupCount] = useState(0)

  // ── Parse CSV ─────────────────────────────────────────────────────────────

  function parseFile(file: File) {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      addToast('Only CSV files are supported. Please upload a .csv file.', 'error')
      return
    }
    setFileName(file.name)
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const headers = results.meta.fields ?? []
        const rows = results.data as Record<string, string>[]
        const autoMapped: Record<string, CRMFieldKey> = {}
        headers.forEach((h) => { autoMapped[h] = autoMatch(h) })
        setParsed({ headers, rows })
        setMapping(autoMapped)
        setStep('mapping')
      },
      error() {
        addToast('Failed to parse CSV. Please check the file format.', 'error')
      },
    })
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    parseFile(files[0])
  }

  // ── Mapping validation ────────────────────────────────────────────────────

  const mappedToName = Object.values(mapping).includes('name')
  const mappedToEmail = Object.values(mapping).includes('email')
  const canProceedMapping = mappedToName && mappedToEmail

  // ── Build validated rows ──────────────────────────────────────────────────

  function buildValidation() {
    if (!parsed) return
    const emailsSeen = new Set<string>()
    let dups = 0

    const rows: ValidationRow[] = parsed.rows.map((row) => {
      const mapped: Record<string, string> = {}
      Object.entries(mapping).forEach(([header, field]) => {
        if (field !== '_skip') mapped[field] = (row[header] ?? '').trim()
      })

      const issues: string[] = []
      if (!mapped.name) issues.push('Missing Name')
      if (!mapped.email) issues.push('Missing Email')
      else if (!isValidEmail(mapped.email)) issues.push('Invalid Email')
      else {
        const low = mapped.email.toLowerCase()
        if (emailsSeen.has(low)) { issues.push('Duplicate in file'); dups++ }
        else emailsSeen.add(low)
      }

      return { row, mapped, issues }
    })

    setDupCount(dups)
    setValidatedRows(rows)
    setStep('validation')
  }

  // ── Confirm import ────────────────────────────────────────────────────────

  async function handleConfirmImport() {
    setImporting(true)
    setProgress(0)

    const validRows = validatedRows.filter((r) => r.issues.length === 0)
    const contacts = validRows.map((r) => ({
      name: r.mapped.name,
      email: r.mapped.email,
      phone: r.mapped.phone,
      segment: (r.mapped.segment as Segment) || 'General',
      persona: r.mapped.persona,
    }))

    // Simulate progress
    const total = contacts.length || 1
    for (let i = 0; i <= total; i++) {
      await new Promise((res) => setTimeout(res, Math.max(30, 600 / total)))
      setProgress(Math.round((i / total) * 100))
    }

    const { added, skipped } = importContacts(contacts)
    setImporting(false)
    addToast(`Import Successful: ${added} contact${added !== 1 ? 's' : ''} added, ${skipped + dupCount} duplicate${skipped + dupCount !== 1 ? 's' : ''} skipped.`)
    onClose()
  }

  // ── Drag & drop ───────────────────────────────────────────────────────────

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }, [])

  // ── Render ────────────────────────────────────────────────────────────────

  const validCount = validatedRows.filter((r) => r.issues.length === 0).length
  const warnCount = validatedRows.filter((r) => r.issues.length > 0).length

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(3,17,25,0.88)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="relative flex flex-col rounded-2xl overflow-hidden w-full"
        style={{
          maxWidth: step === 'mapping' ? '760px' : '600px',
          maxHeight: '90vh',
          background: 'rgba(27,53,79,0.25)',
          border: '1px solid rgba(1,180,175,0.2)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div>
            <h2 className="text-base font-semibold" style={{ color: '#F7F7F7' }}>
              Smart Importer
            </h2>
            <div className="flex items-center gap-2 mt-1">
              {(['upload', 'mapping', 'validation'] as Step[]).map((s, i) => (
                <React.Fragment key={s}>
                  <span
                    className="text-xs font-medium capitalize"
                    style={{ color: step === s ? '#01B4AF' : 'rgba(247,247,247,0.35)' }}
                  >
                    {i + 1}. {s}
                  </span>
                  {i < 2 && <span style={{ color: 'rgba(247,247,247,0.2)' }}>›</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: 'rgba(247,247,247,0.5)' }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">

          {/* ── Step 1: Upload ── */}
          {step === 'upload' && (
            <div className="flex flex-col items-center gap-6">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-4 rounded-2xl py-16 px-8 cursor-pointer transition-all"
                style={{
                  border: `2px dashed ${dragOver ? '#01B4AF' : 'rgba(255,255,255,0.15)'}`,
                  background: dragOver ? 'rgba(1,180,175,0.06)' : 'rgba(255,255,255,0.03)',
                }}
              >
                <div className="text-5xl">📋</div>
                <div className="text-center">
                  <p className="text-sm font-medium mb-1" style={{ color: '#F7F7F7' }}>
                    Drop your CSV here, or click to browse
                  </p>
                  <p className="text-xs" style={{ color: 'rgba(247,247,247,0.45)' }}>
                    Supported format: .csv
                  </p>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </div>

              <button
                onClick={downloadTemplate}
                className="text-sm underline underline-offset-4 transition-opacity hover:opacity-75"
                style={{ color: '#01B4AF' }}
              >
                Download Template CSV
              </button>
            </div>
          )}

          {/* ── Step 2: Column Mapping ── */}
          {step === 'mapping' && parsed && (
            <div className="flex flex-col gap-5">
              <p className="text-sm" style={{ color: 'rgba(247,247,247,0.65)' }}>
                Match your file&apos;s columns to TouchPulse fields. <strong style={{ color: '#F7F7F7' }}>Name</strong> and <strong style={{ color: '#F7F7F7' }}>Email</strong> are required.
              </p>

              {/* Mapping table */}
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <th className="text-left px-4 py-2.5 font-medium" style={{ color: 'rgba(247,247,247,0.55)', width: '45%' }}>
                        Your File Column
                      </th>
                      <th className="text-left px-4 py-2.5 font-medium" style={{ color: 'rgba(247,247,247,0.55)' }}>
                        TouchPulse Field
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.headers.map((header, i) => (
                      <tr
                        key={header}
                        style={{
                          borderTop: '1px solid rgba(255,255,255,0.05)',
                          background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                        }}
                      >
                        <td className="px-4 py-2.5 font-mono text-xs" style={{ color: '#01B4AF' }}>
                          {header}
                        </td>
                        <td className="px-4 py-2.5">
                          <select
                            value={mapping[header] ?? '_skip'}
                            onChange={(e) => setMapping((m) => ({ ...m, [header]: e.target.value as CRMFieldKey }))}
                            className="rounded-lg px-2 py-1 text-xs w-full outline-none"
                            style={{
                              background: 'rgba(255,255,255,0.07)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              color: mapping[header] && mapping[header] !== '_skip' ? '#01B4AF' : 'rgba(247,247,247,0.6)',
                            }}
                          >
                            {CRM_FIELDS.map((f) => (
                              <option key={f.key} value={f.key} style={{ background: '#031119' }}>
                                {f.label}
                                {f.required ? ' *' : ''}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {!canProceedMapping && (
                <p className="text-xs" style={{ color: '#DC2626' }}>
                  ⚠ You must map at least <strong>Name</strong> and <strong>Email</strong> to proceed.
                </p>
              )}

              {/* Preview rows */}
              {parsed.rows.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(247,247,247,0.4)' }}>
                    Data Preview (first 3 rows)
                  </p>
                  <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                    <table className="text-xs w-full">
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                          {parsed.headers.map((h) => (
                            <th key={h} className="text-left px-3 py-2 font-medium whitespace-nowrap" style={{ color: 'rgba(247,247,247,0.5)' }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsed.rows.slice(0, 3).map((row, i) => (
                          <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            {parsed.headers.map((h) => (
                              <td key={h} className="px-3 py-2 whitespace-nowrap" style={{ color: 'rgba(247,247,247,0.75)' }}>
                                {row[h] ?? ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Validation ── */}
          {step === 'validation' && (
            <div className="flex flex-col gap-5">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Rows', value: validatedRows.length, color: '#F7F7F7' },
                  { label: 'Ready to Import', value: validCount, color: '#22c55e' },
                  { label: 'Issues / Skipped', value: warnCount, color: warnCount > 0 ? '#DC2626' : '#F7F7F7' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl px-4 py-3 text-center"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(247,247,247,0.5)' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Sims Health preview */}
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{ background: 'rgba(1,180,175,0.06)', border: '1px solid rgba(1,180,175,0.2)' }}
              >
                <p className="font-medium mb-1" style={{ color: '#01B4AF' }}>
                  🎮 Initial Health Preview
                </p>
                <p style={{ color: 'rgba(247,247,247,0.65)' }}>
                  All {validCount} new contacts will start with a <strong style={{ color: '#01B4AF' }}>Neutral Teal Plumbob (60%)</strong> — representing a fresh start with untested potential.
                </p>
              </div>

              {/* Validation table */}
              {warnCount > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(247,247,247,0.4)' }}>
                    Rows with Issues (will be skipped)
                  </p>
                  <div className="overflow-y-auto rounded-xl max-h-48" style={{ border: '1px solid rgba(220,38,38,0.2)' }}>
                    <table className="text-xs w-full">
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <th className="text-left px-3 py-2 font-medium" style={{ color: 'rgba(247,247,247,0.5)' }}>Name</th>
                          <th className="text-left px-3 py-2 font-medium" style={{ color: 'rgba(247,247,247,0.5)' }}>Email</th>
                          <th className="text-left px-3 py-2 font-medium" style={{ color: '#DC2626' }}>Issues</th>
                        </tr>
                      </thead>
                      <tbody>
                        {validatedRows.filter((r) => r.issues.length > 0).map((r, i) => (
                          <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <td className="px-3 py-2" style={{ color: 'rgba(247,247,247,0.75)' }}>{r.mapped.name || '—'}</td>
                            <td className="px-3 py-2" style={{ color: 'rgba(247,247,247,0.75)' }}>{r.mapped.email || '—'}</td>
                            <td className="px-3 py-2 font-medium" style={{ color: '#DC2626' }}>{r.issues.join(', ')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Progress bar */}
              {importing && (
                <div>
                  <div className="flex justify-between text-xs mb-1" style={{ color: 'rgba(247,247,247,0.55)' }}>
                    <span>Importing…</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-200"
                      style={{ width: `${progress}%`, background: '#01B4AF' }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0 gap-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          {step !== 'upload' ? (
            <button
              onClick={() => setStep(step === 'validation' ? 'mapping' : 'upload')}
              disabled={importing}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/10 disabled:opacity-40"
              style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(247,247,247,0.7)' }}
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step === 'mapping' && (
            <button
              onClick={buildValidation}
              disabled={!canProceedMapping}
              className="px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#01B4AF', color: '#031119' }}
            >
              Validate →
            </button>
          )}

          {step === 'validation' && (
            <button
              onClick={handleConfirmImport}
              disabled={importing || validCount === 0}
              className="px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#FFB100', color: '#031119' }}
            >
              {importing ? 'Importing…' : `Confirm & Import ${validCount} Contact${validCount !== 1 ? 's' : ''}`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
