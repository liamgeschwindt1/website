import HomeClient from '@/components/HomeClient'
import { fetchSiteCopy, fetchFooterContent } from '@/lib/cms'

export const revalidate = 60

export default async function Home() {
  const [siteCopy, footerDescription] = await Promise.all([
    fetchSiteCopy(),
    fetchFooterContent(),
  ])

  return <HomeClient siteCopy={siteCopy} footerDescription={footerDescription} />
}

