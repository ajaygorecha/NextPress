'use client'

import { useState } from 'react'
import PostCard from './PostCard'
import Link from 'next/link'
import type { Post } from '@/types'

interface Props {
  posts: (Post & { [key: string]: any })[]
  count: number
  q?: string
  currentPage: number
  totalPages: number
}

export default function BlogPosts({ posts, count, q, currentPage, totalPages }: Props) {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')

  return (
    <>
      {/* Toolbar */}
      <div className="blog-toolbar">
        <p className="blog-toolbar-count">
          {q ? (
            <>
              <strong>{count}</strong> result{count !== 1 ? 's' : ''} for &ldquo;{q}&rdquo;
              <Link href="/blog" className="ms-2 text-primary small">Clear</Link>
            </>
          ) : (
            <><strong>{count}</strong> article{count !== 1 ? 's' : ''}</>
          )}
        </p>
        <div className="layout-toggle">
          <button
            className={`layout-btn ${layout === 'grid' ? 'active' : ''}`}
            onClick={() => setLayout('grid')}
            title="Grid view"
          >
            <i className="ri-layout-grid-line" />
          </button>
          <button
            className={`layout-btn ${layout === 'list' ? 'active' : ''}`}
            onClick={() => setLayout('list')}
            title="List view"
          >
            <i className="ri-list-check-2" />
          </button>
        </div>
      </div>

      {/* Posts */}
      {posts.length > 0 ? (
        <div className={layout === 'grid' ? 'row g-4' : 'posts-list'}>
          {posts.map((post) =>
            layout === 'grid' ? (
              <div key={post.id} className="col-sm-6 col-lg-4">
                <PostCard post={post} />
              </div>
            ) : (
              <PostListItem key={post.id} post={post} />
            )
          )}
        </div>
      ) : (
        <div className="blog-empty">
          <i className="ri-article-line" />
          <p>No posts found.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-5 d-flex justify-content-center">
          <ul className="pagination blog-pagination">
            {currentPage > 1 && (
              <li className="page-item">
                <Link className="page-link" href={`/blog?${q ? `q=${q}&` : ''}page=${currentPage - 1}`}>
                  <i className="ri-arrow-left-s-line" />
                </Link>
              </li>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <li key={p} className={`page-item ${p === currentPage ? 'active' : ''}`}>
                <Link className="page-link" href={`/blog?${q ? `q=${q}&` : ''}page=${p}`}>{p}</Link>
              </li>
            ))}
            {currentPage < totalPages && (
              <li className="page-item">
                <Link className="page-link" href={`/blog?${q ? `q=${q}&` : ''}page=${currentPage + 1}`}>
                  <i className="ri-arrow-right-s-line" />
                </Link>
              </li>
            )}
          </ul>
        </nav>
      )}
    </>
  )
}

function PostListItem({ post }: { post: Post & { [key: string]: any } }) {
  const excerpt = post.content
    ? post.content.replace(/<[^>]*>/g, '').slice(0, 160) + '…'
    : ''

  return (
    <article className="post-list-item">
      {post.featured_image && (
        <Link href={`/blog/${post.slug}`} className="post-list-img-link">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.featured_image} alt={post.title} className="post-list-img" />
        </Link>
      )}
      <div className="post-list-body">
        <h5 className="post-list-title">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h5>
        {excerpt && <p className="post-list-excerpt">{excerpt}</p>}
        <div className="post-meta">
          <span>
            <i className="ri-calendar-line me-1" />
            {new Date(post.created_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </span>
          <Link href={`/blog/${post.slug}`} className="post-list-read">
            Read more <i className="ri-arrow-right-line" />
          </Link>
        </div>
      </div>
    </article>
  )
}
