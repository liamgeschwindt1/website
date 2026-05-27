import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { fetchPost, fetchPosts } from '@/lib/cms'

export const revalidate = 60

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  const posts = await fetchPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await fetchPost(params.slug)
  if (!post) return { title: 'Post not found — Touchpulse' }
  return {
    title: `${post.title} — Touchpulse`,
    description: post.excerpt ?? undefined,
    openGraph: post.coverImage ? { images: [post.coverImage] } : undefined,
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function BlogPostPage({ params }: Props) {
  const post = await fetchPost(params.slug)
  if (!post) notFound()

  return (
    <>
      <Nav />
      <main className="pt-[60px]">
        <article>
          {/* Header */}
          <header className="px-[clamp(24px,5vw,80px)] py-[64px] border-b border-[var(--border)] max-w-[800px] mx-auto">
            <Link
              href="/blog"
              className="text-[13px] text-[var(--muted)] no-underline hover:text-[var(--teal)] transition-colors duration-150 mb-8 inline-block"
            >
              ← Back to blog
            </Link>
            {post.publishedAt && (
              <time dateTime={post.publishedAt} className="block text-[13px] text-[var(--muted)] mb-4">
                {formatDate(post.publishedAt)}
              </time>
            )}
            <h1 className="text-[clamp(28px,4vw,52px)] font-medium tracking-[-0.03em] leading-[1.12] text-[var(--text)] mb-0">
              {post.title}
            </h1>
          </header>

          {/* Cover image */}
          {post.coverImage && (
            <div className="px-[clamp(24px,5vw,80px)] py-8 max-w-[900px] mx-auto">
              <div className="relative w-full aspect-[16/9] rounded-[16px] overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 900px"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div
            className="px-[clamp(24px,5vw,80px)] pb-[96px] max-w-[720px] mx-auto prose prose-invert prose-lg"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>
      <Footer />
    </>
  )
}
