import Link from 'next/link'
import type { Post } from '@/types'

interface Props {
  post: Post & {
    users?: { name: string } | null
    categories?: { name: string; slug: string } | null
    author?: { name: string } | null
    category?: { name: string; slug: string } | null
  }
}

export default function PostCard({ post }: Props) {
  const category = post.categories || post.category
  const authorName = post.users?.name || post.author?.name

  // Strip HTML tags for excerpt
  const excerpt = post.content
    ? post.content.replace(/<[^>]*>/g, '').slice(0, 120) + '…'
    : ''

  return (
    <article className="post-card card h-100">
      <Link href={`/blog/${post.slug}`} className="post-card-img-link">
        {post.featured_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.featured_image} alt={post.title} className="post-img" />
        ) : (
          <div className="post-img-placeholder">
            <i className="ri-image-line" />
          </div>
        )}
      </Link>

      <div className="card-body p-4 d-flex flex-column">
        {category && (
          <Link
            href={`/category/${category.slug}`}
            className="post-category-badge"
          >
            {category.name}
          </Link>
        )}

        <h5 className="post-title mt-2">
          <Link href={`/blog/${post.slug}`} className="text-decoration-none text-dark">
            {post.title}
          </Link>
        </h5>

        {excerpt && (
          <p className="post-excerpt text-muted small mb-3">{excerpt}</p>
        )}

        <div className="post-meta mt-auto">
          <span>
            <i className="ri-user-3-line me-1" />
            {authorName || 'Editorial'}
          </span>
          <span>
            <i className="ri-calendar-line me-1" />
            {new Date(post.created_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </span>
        </div>
      </div>
    </article>
  )
}
