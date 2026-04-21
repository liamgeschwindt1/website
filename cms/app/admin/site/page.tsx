export default function SitePage() {
  return (
    <div className="px-8 py-8 max-w-2xl">
      <h1 className="text-[22px] font-semibold tracking-tight mb-2" style={{ color: 'var(--text)' }}>Site Requests</h1>
      <p className="text-[14px] mb-4" style={{ color: 'var(--muted)' }}>
        The separate site annotator has been retired. Frontend requests now live in the floating Request to devs button so page, section, and pin context stay in one workflow.
      </p>
      <div className="p-5 rounded-[12px] border" style={{ borderColor: 'var(--border)', background: 'rgba(27,53,79,0.18)' }}>
        <p className="text-[13px] leading-[1.7]" style={{ color: 'var(--body)' }}>
          Use the bottom-right widget, choose Frontend, then pick the page and optionally add section details or a pin position in percentages.
        </p>
      </div>
    </div>
  )
}
