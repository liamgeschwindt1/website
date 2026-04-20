export default function ProofBar() {
  const logos = ['Blind Veterans UK', 'NS', 'Radboud UMC', 'TU/e', 'ProRail']

  return (
    <div className="flex items-center gap-10 flex-wrap px-[clamp(24px,5vw,80px)] py-6 border-t border-b border-[var(--border)]">
      <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--muted)] whitespace-nowrap">
        Trusted by
      </span>
      <div className="flex items-center gap-10 flex-wrap" aria-label="Partner logos">
        {logos.map((logo) => (
          <span
            key={logo}
            className="text-[13px] text-[rgba(247,247,247,0.38)] font-medium tracking-[0.01em]"
          >
            {logo}
          </span>
        ))}
      </div>
    </div>
  )
}
