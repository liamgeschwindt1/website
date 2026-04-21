export default function SettingsPage() {
  return (
    <div className="px-8 py-8 max-w-2xl">
      <h1 className="text-[22px] font-semibold tracking-tight mb-2" style={{ color: 'var(--text)' }}>Settings</h1>
      <p className="text-[14px] mb-8" style={{ color: 'var(--muted)' }}>Environment configuration for this CMS instance.</p>

      <div className="flex flex-col gap-6">
        {[
          { key: 'GITHUB_TOKEN', desc: 'Personal access token for creating GitHub issues via the annotator and dev request widget. Needs repo scope.', required: true },
          { key: 'GITHUB_REPO', desc: 'Target repo for issues (format: owner/repo). Defaults to liamgeschwindt1/website.', required: false },
          { key: 'NEXT_PUBLIC_SITE_URL', desc: 'Live site URL loaded in the Site Annotator iframe. Defaults to https://touchpulse.nl.', required: false },
          { key: 'NEXTAUTH_SECRET', desc: 'NextAuth session signing secret (≥32 chars).', required: true },
          { key: 'NEXTAUTH_URL', desc: 'Full URL of this CMS (no trailing slash).', required: true },
          { key: 'DATABASE_URL', desc: 'PostgreSQL connection string. Auto-injected by Railway.', required: true },
          { key: 'GOOGLE_CLIENT_ID', desc: 'Google OAuth client ID for admin sign-in.', required: true },
          { key: 'GOOGLE_CLIENT_SECRET', desc: 'Google OAuth client secret.', required: true },
        ].map(item => (
          <div key={item.key} className="p-5 rounded-[10px] border" style={{ borderColor: 'var(--border)', background: 'rgba(27,53,79,0.2)' }}>
            <div className="flex items-center gap-2 mb-2">
              <code className="text-[13px] font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--teal)' }}>{item.key}</code>
              {item.required && (
                <span className="text-[10px] px-1.5 py-0.5 rounded border font-medium" style={{ color: '#f87171', borderColor: 'rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.08)' }}>required</span>
              )}
            </div>
            <p className="text-[13px] leading-[1.6]" style={{ color: 'var(--muted)' }}>{item.desc}</p>
          </div>
        ))}

        <div className="p-5 rounded-[10px] border" style={{ borderColor: 'rgba(1,180,175,0.3)', background: 'rgba(1,180,175,0.05)' }}>
          <p className="text-[13px] font-medium mb-1" style={{ color: 'var(--teal)' }}>How to set these</p>
          <p className="text-[13px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
            Go to Railway → secure-appreciation project → CMS service → Variables tab. Add each variable and redeploy.
          </p>
        </div>
      </div>
    </div>
  )
}
