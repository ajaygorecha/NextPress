import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import BlogNav from '@/components/ui/BlogNav'
import BlogPosts from '@/components/ui/BlogPosts'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Blog | NextPress',
  description: 'Read the latest articles and posts.',
}

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>
}

const PAGE_SIZE = 9

export default async function BlogPage({ searchParams }: Props) {
  const { q, page } = await searchParams
  const currentPage = parseInt(page || '1', 10)
  const offset = (currentPage - 1) * PAGE_SIZE

  const supabase = await createClient()

  // Fetch featured post (latest published)
  const { data: featuredPost } = !q
    ? await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
    : { data: null }

  let query = supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  // skip featured post in grid
  if (featuredPost && !q) {
    query = query.neq('id', featuredPost.id)
  }

  query = query.range(offset, offset + PAGE_SIZE - 1)

  if (q) query = query.ilike('title', `%${q}%`)

  const { data: posts, count, error: postsError } = await query
  if (postsError) console.error('[blog] query error:', postsError.message, postsError.code)

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE)

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name')

  const featuredExcerpt = featuredPost?.content
    ? featuredPost.content.replace(/<[^>]*>/g, '').slice(0, 200) + '…'
    : ''

  return (
    <>
      <BlogNav />

      {/* Hero */}
      <section className="blog-hero">
        <div className="blog-hero-bg" />
        <div className="container position-relative">
          <div className="row align-items-center g-5">
            {/* Left: headline + search */}
            <div className="col-lg-5">
              <div className="blog-hero-eyebrow">
                <span className="blog-hero-dot-pulse" />
                Fresh articles
              </div>
              <h1 className="blog-hero-title">
                Ideas worth<br />
                <span className="blog-hero-title-accent">reading.</span>
              </h1>
              <p className="blog-hero-sub">
                Deep dives, how-tos, and stories from across the web.
              </p>
              <form method="GET" action="/blog" className="blog-search-form">
                <i className="ri-search-line blog-search-icon" />
                <input
                  name="q"
                  type="text"
                  className="blog-search-input"
                  placeholder="Search articles…"
                  defaultValue={q || ''}
                />
                <button type="submit" className="blog-search-btn">Search</button>
              </form>
            </div>

            {/* Right: featured post card */}
            {featuredPost && (
              <div className="col-lg-7">
                <Link href={`/blog/${featuredPost.slug}`} className="featured-card">
                  {featuredPost.featured_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featuredPost.featured_image}
                      alt={featuredPost.title}
                      className="featured-card-img"
                    />
                  ) : (
                    <div className="featured-card-placeholder">
                      <i className="ri-article-line" />
                    </div>
                  )}
                  <div className="featured-card-body">
                    <span className="featured-card-badge">Featured</span>
                    <h2 className="featured-card-title">{featuredPost.title}</h2>
                    <p className="featured-card-excerpt">{featuredExcerpt}</p>
                    <span className="featured-card-date">
                      <i className="ri-calendar-line me-1" />
                      {new Date(featuredPost.created_at).toLocaleDateString('en-US', {
                        month: 'long', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories strip */}
      {categories && categories.length > 0 && !q && (
        <div className="category-strip">
          <div className="container">
            <div className="category-strip-inner">
              <span className="category-strip-label">Browse by</span>
              {categories.map((cat) => (
                <Link key={cat.id} href={`/category/${cat.slug}`} className="category-chip">
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Posts body */}
      <div className="blog-body">
        <div className="container">
          {!q && (
            <div className="section-heading">
              <h2 className="section-title">Latest Articles</h2>
              <div className="section-line" />
            </div>
          )}
          <BlogPosts
            posts={posts || []}
            count={count || 0}
            q={q}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
      </div>

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
