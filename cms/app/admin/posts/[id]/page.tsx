import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PostForm from '@/components/PostForm'

interface Props {
  params: { id: string }
}

export default async function EditPostPage({ params }: Props) {
  const post = await prisma.post.findUnique({ where: { id: params.id } })
  if (!post) notFound()

  return <PostForm mode="edit" post={post} />
}
