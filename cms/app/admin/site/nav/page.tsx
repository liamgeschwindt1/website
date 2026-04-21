export default function NavSettingsPage() {
  return (
    <div className="px-8 py-8 max-w-2xl">
      <h1 className="text-[22px] font-semibold tracking-tight mb-2" style={{ color: 'var(--text)' }}>Navigation</h1>
      <p className="text-[14px] mb-6" style={{ color: 'var(--muted)' }}>Manage site navigation links. Use the Request to devs widget to request navigation changes.</p>
      <div className="p-6 rounded-[10px] border" style={{ borderColor: 'rgba(1,180,175,0.3)', background: 'rgba(1,180,175,0.05)' }}>
        <p className="text-[14px] font-medium mb-2" style={{ color: 'var(--teal)' }}>Navigation is code-managed</p>
        <p className="text-[13px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
          The site navigation is defined in <code style={{ color: 'var(--teal)' }}>touchpulse/components/Nav.tsx</code>.
          To request a nav change, use the dev request widget in the bottom-right corner.
        </p>
      </div>
    </div>
  )
}
