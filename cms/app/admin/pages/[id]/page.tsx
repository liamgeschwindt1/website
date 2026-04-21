import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PageForm from '@/components/PageForm'

export const dynamic = 'force-dynamic'

export default async function EditPagePage({ params }: { params: { id: string } }) {
  const page = await prisma.page.findUnique({ where: { id: params.id } })
  if (!page) notFound()
  return (
    <PageForm
      mode="edit"
      page={{
        id: page.id,
        title: page.title,
        slug: page.slug,
        content: page.content,
        excerpt: page.excerpt,
        seoTitle: page.seoTitle,
        seoDesc: page.seoDesc,
        published: page.published,
      }}
    />
  )
}
