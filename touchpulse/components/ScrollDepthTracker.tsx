'use client'

import { useScrollDepth } from '@/lib/posthog'

export default function ScrollDepthTracker() {
  useScrollDepth()
  return null
}
