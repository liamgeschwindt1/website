import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { fetchPosts } from '@/lib/cms'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Blog — Touchpulse',
  description: 'Thoughts on accessible navigation, orientation and mobility, and building Tiera.',
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function BlogPage() {
  const posts = await fetchPosts()

  return (
    <>
      <Nav />
      <main className="pt-[60px]">
        <section
          aria-labelledby="blog-heading"
          className="px-[clamp(24px,5vw,80px)] py-[80px] border-b border-[var(--border)]"
        >
          <p className="text-[11px] font-medium tracking-[0.1em] uppercase mb-4" style={{ color: 'var(--teal)' }}>
            ✦ TOUCHPULSE BLOG
          </p>
          <h1
            id="blog-heading"
            className="text-[clamp(40px,5.5vw,68px)] font-medium tracking-[-0.03em] leading-[1.07] text-[var(--text)] mb-4"
          >
            Writing.
          </h1>
          <p className="text-[18px] text-[var(--body)] leading-[1.75] max-w-[560px]">
            Thoughts on accessible navigation, orientation and mobility, and how we are building Tiera.
          </p>
        </section>

        {posts.length > 0 ? (
          <section aria-label="Blog posts" className="px-[clamp(24px,5vw,80px)] py-[80px]">
            <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="flex flex-col rounded-[16px] overflow-hidden border border-[var(--border)] bg-[var(--surface)] hover:border-[rgba(1,180,175,0.4)] transition-colors duration-200"
                >
                  {post.coverImage && (
                    <div className="relative w-full aspect-[16/9] overflow-hidden">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div className="flex flex-col flex-1 p-6">
                    {post.publishedAt && (
                      <time dateTime={post.publishedAt} className="text-[12px] text-[var(--muted)] mb-3">
                        {formatDate(post.publishedAt)}
                      </time>
                    )}
                    <h2 className="text-[18px] font-medium leading-[1.4] text-[var(--text)] mb-3">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="no-underline hover:text-[var(--teal)] transition-colors duration-150"
                      >
                        {post.title}
                      </Link>
                    </h2>
                    {post.excerpt && (
                      <p className="text-[14px] text-[var(--body)] leading-[1.65] flex-1">{post.excerpt}</p>
                    )}
                    <Link
                      href={`/blog/${post.slug}`}
                      className="mt-5 text-[13px] no-underline transition-colors duration-150 self-start"
                      style={{ color: 'var(--teal)' }}
                    >
                      Read more →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <section
            aria-label="Blog posts coming soon"
            className="px-[clamp(24px,5vw,80px)] py-[96px] flex items-center justify-center min-h-[40vh]"
          >
            <div className="text-center max-w-[460px]">
              <div
                className="inline-flex items-center px-4 py-2 rounded-full text-[12px] mb-6"
                style={{ background: 'rgba(1,180,175,0.10)', border: '1px solid rgba(1,180,175,0.3)', color: 'var(--teal)' }}
              >
                First posts coming soon
              </div>
              <p className="text-[16px] text-[var(--muted)] leading-[1.75]">
                We are writing about the technology, the people who use it, and the decisions behind what we build. Subscribe to stay updated.
              </p>
              <a
                href="mailto:info@touchpulse.nl"
                className="inline-flex items-center px-5 py-3 mt-8 no-underline transition-colors duration-150 min-h-[44px]"
                style={{ border: '0.5px solid var(--teal)', borderRadius: 6, color: 'var(--teal)', fontSize: 14 }}
              >
                Notify me when posts are live
              </a>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
