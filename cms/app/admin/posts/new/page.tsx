import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import PostForm from '@/components/PostForm'

export default async function NewPostPage() {
  const session = await getSession()
  if (!session.isLoggedIn) redirect('/admin/login')

  return <PostForm mode="new" />
}
