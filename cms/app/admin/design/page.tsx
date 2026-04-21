export default function DesignPage() {
  return (
    <div className="px-8 py-8 max-w-2xl">
      <h1 className="text-[22px] font-semibold tracking-tight mb-2" style={{ color: 'var(--text)' }}>Design Requests</h1>
      <p className="text-[14px] mb-4" style={{ color: 'var(--muted)' }}>
        Design change requests now run through the Request to devs widget so the page, section, and location details travel with the issue.
      </p>
      <div className="p-5 rounded-[12px] border" style={{ borderColor: 'var(--border)', background: 'rgba(27,53,79,0.18)' }}>
        <p className="text-[13px] leading-[1.7]" style={{ color: 'var(--body)' }}>
          Choose Frontend in the widget, select the page, add any section notes, and include pin percentages when you need pixel-level feedback.
        </p>
      </div>
    </div>
  )
}
