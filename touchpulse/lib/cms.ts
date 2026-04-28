import siteCopy from '@/content/siteCopy.json'

export type SiteCopy = typeof siteCopy

interface CmsWebsiteCopy {
  hero?: Partial<SiteCopy['hero']>
  proofBar?: {
    trustedByLabel?: string
    stats?: Array<{ number: string; label: string; color?: string }>
  }
  ctaBanner?: Partial<SiteCopy['ctaBanner']>
}

const CMS_URL = process.env.NEXT_CMS_URL ?? ''

export async function fetchSiteCopy(): Promise<SiteCopy> {
  if (!CMS_URL) return siteCopy

  try {
    const res = await fetch(`${CMS_URL}/api/content/website-copy`, {
      next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
    })
    if (!res.ok) return siteCopy

    const data = await res.json() as { value?: CmsWebsiteCopy }
    const v = data?.value
    if (!v) return siteCopy

    return {
      hero: { ...siteCopy.hero, ...v.hero },
      proofBar: {
        trustedByLabel: v.proofBar?.trustedByLabel ?? siteCopy.proofBar.trustedByLabel,
        stats: v.proofBar?.stats?.length ? v.proofBar.stats : siteCopy.proofBar.stats,
      },
      ctaBanner: { ...siteCopy.ctaBanner, ...v.ctaBanner },
    } as SiteCopy
  } catch {
    // CMS unreachable — fall back to bundled JSON silently
    return siteCopy
  }
}

export async function fetchFooterContent(): Promise<string> {
  if (!CMS_URL) return ''

  try {
    const res = await fetch(`${CMS_URL}/api/content/footer`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return ''
    const data = await res.json() as { value?: string }
    return data?.value ?? ''
  } catch {
    return ''
  }
}
