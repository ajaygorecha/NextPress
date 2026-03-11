import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import BlogNav from '@/components/ui/BlogNav'
import ShareButtons from '@/components/ui/ShareButtons'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('posts')
    .select('title, meta_title, meta_description, featured_image')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!post) return { title: 'Post not found' }

  return {
    title: post.meta_title || post.title,
    description: post.meta_description,
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || undefined,
      images: post.featured_image ? [post.featured_image] : [],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('*, post_tags(tags(id, name, slug))')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!post) notFound()

  const tags = post.post_tags?.map((pt: any) => pt.tags).filter(Boolean) || []

  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = host.startsWith('localhost') ? 'http' : 'https'
  const postUrl = `${protocol}://${host}/blog/${post.slug}`

  const readingTime = Math.max(1, Math.ceil(
    post.content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200
  ))

  return (
    <>
      <BlogNav />

      <article>
        {/* Post Hero */}
        <div className={`post-hero ${post.featured_image ? 'post-hero--image' : 'post-hero--plain'}`}>
          {post.featured_image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.featured_image} alt={post.title} className="post-hero-img" />
          )}
          <div className="post-hero-overlay" />
          <div className="container position-relative">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <Link href="/blog" className="post-back-link">
                  <i className="ri-arrow-left-line me-1" />
                  Back to Blog
                </Link>
                <h1 className="post-hero-title">{post.title}</h1>
                <div className="post-hero-meta">
                  <span>
                    <i className="ri-calendar-line me-1" />
                    {new Date(post.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </span>
                  <span className="post-hero-dot" />
                  <span>
                    <i className="ri-time-line me-1" />
                    {readingTime} min read
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Post Body */}
        <div className="container post-body">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div
                className="post-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Share */}
              <ShareButtons title={post.title} url={postUrl} />

              {/* Tags */}
              {tags.length > 0 && (
                <div className="post-tags">
                  <span className="post-tags-label">
                    <i className="ri-price-tag-3-line me-1" />
                    Tags
                  </span>
                  {tags.map((tag: any) => (
                    <Link
                      key={tag.id}
                      href={`/tag/${tag.slug}`}
                      className="post-tag"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Back link */}
              <div className="mt-5 pt-4 border-top">
                <Link href="/blog" className="btn-back-blog">
                  <i className="ri-arrow-left-line me-2" />
                  All Articles
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>

      <footer className="blog-footer">
        <div className="container">
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
            <span className="blog-footer-brand">
              <i className="ri-quill-pen-fill me-2" />
              NextPress
            </span>
            <span className="text-muted small">
              © {new Date().getFullYear()} NextPress. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </>
  )
}
