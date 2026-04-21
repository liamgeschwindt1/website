'use client'

export default function CookieResetButton({ variant = 'button' }: { variant?: 'button' | 'link' }) {
  function handleClick() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tp_cookie_consent')
      window.location.reload()
    }
  }

  if (variant === 'link') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="text-[13px] no-underline hover:text-[var(--text)] transition-colors duration-150"
        style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        Cookie settings
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="px-5 py-2.5 rounded-[8px] text-[14px] font-medium border transition-colors"
      style={{ borderColor: 'rgba(1,180,175,0.4)', color: '#01b4af', background: 'transparent' }}
    >
      ⚙ Open cookie settings
    </button>
  )
}
