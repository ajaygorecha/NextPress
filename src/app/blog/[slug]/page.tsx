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

  const [{ data: post }, { data: categories }, { data: allTags }, { data: sidebarSetting }] = await Promise.all([
    supabase
      .from('posts')
      .select('*, post_tags(tags(id, name, slug))')
      .eq('slug', slug)
      .eq('status', 'published')
      .single(),
    supabase
      .from('categories')
      .select('id, name, slug')
      .order('name'),
    supabase
      .from('tags')
      .select('id, name, slug')
      .order('name'),
    supabase
      .from('settings')
      .select('value')
      .eq('key', 'sidebar_widgets')
      .single(),
  ])

  const sidebarWidgets: Record<string, boolean> = sidebarSetting?.value ?? {
    categories: true,
    recent_posts: true,
    tags: true,
  }

  if (!post) notFound()

  const { data: recentPosts } = await supabase
    .from('posts')
    .select('id, title, slug, featured_image, created_at')
    .eq('status', 'published')
    .neq('slug', slug)
    .order('created_at', { ascending: false })
    .limit(5)

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

        {/* Breadcrumbs */}
        <div className="post-breadcrumb-bar">
          <div className="container">
            <nav aria-label="breadcrumb">
              <ol className="post-breadcrumb">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li className="active">{post.title}</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Post Body */}
        <div className="container post-body">
          <div className="row g-4">
            {/* Main Content Box */}
            <div className="col-lg-8">
              <div className="post-content-box">
                <div
                  className="post-content"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

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

                {/* Share */}
                <ShareButtons title={post.title} url={postUrl} />

                {/* Back link */}
                <div className="mt-4 pt-4 border-top">
                  <Link href="/blog" className="btn-back-blog">
                    <i className="ri-arrow-left-line me-2" />
                    All Articles
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-lg-4">
              <div className="post-sidebar">
                {sidebarWidgets.categories && categories && categories.length > 0 && (
                  <div className="post-sidebar-widget">
                    <div className="post-sidebar-widget-header">
                      <i className="ri-folder-2-line" />
                      <span>Categories</span>
                    </div>
                    <ul className="post-sidebar-list">
                      {categories.map((cat) => (
                        <li key={cat.id}>
                          <Link href={`/category/${cat.slug}`}>
                            <i className="ri-hashtag" />
                            {cat.name}
                            <i className="ri-arrow-right-s-line ms-auto" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recent Posts */}
                {sidebarWidgets.recent_posts && recentPosts && recentPosts.length > 0 && (
                  <div className="post-sidebar-widget mt-4">
                    <div className="post-sidebar-widget-header">
                      <i className="ri-time-line" />
                      <span>Recent Posts</span>
                    </div>
                    <ul className="post-sidebar-recent">
                      {recentPosts.map((recent) => (
                        <li key={recent.id}>
                          <Link href={`/blog/${recent.slug}`}>
                            {recent.featured_image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={recent.featured_image} alt={recent.title} />
                            ) : (
                              <span className="post-sidebar-recent-placeholder">
                                <i className="ri-article-line" />
                              </span>
                            )}
                            <div>
                              <p>{recent.title}</p>
                              <span>
                                <i className="ri-calendar-line me-1" />
                                {new Date(recent.created_at).toLocaleDateString('en-US', {
                                  month: 'short', day: 'numeric', year: 'numeric',
                                })}
                              </span>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tags */}
                {sidebarWidgets.tags && allTags && allTags.length > 0 && (
                  <div className="post-sidebar-widget mt-4">
                    <div className="post-sidebar-widget-header">
                      <i className="ri-price-tag-3-line" />
                      <span>Tags</span>
                    </div>
                    <div className="post-sidebar-tags">
                      {allTags.map((tag) => (
                        <Link key={tag.id} href={`/tag/${tag.slug}`} className="post-sidebar-tag">
                          <i className="ri-hashtag" />
                          {tag.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
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
