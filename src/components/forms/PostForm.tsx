'use client'

import { useRef, useState, useTransition } from 'react'
import { createPost, updatePost } from '@/lib/actions/posts'
import RichEditor from '@/components/editor/RichEditor'
import type { Post, Category, Tag } from '@/types'

interface Props {
  post?: Post
  categories: Category[]
  tags: Tag[]
  postTags?: Tag[]
}

export default function PostForm({ post, categories, tags, postTags = [] }: Props) {
  const [isPending, startTransition] = useTransition()
  const [selectedTags, setSelectedTags] = useState<string[]>(postTags.map((t) => t.id))
  const formRef = useRef<HTMLFormElement>(null)

  function toggleTag(id: string) {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('tags', selectedTags.join(','))

    startTransition(async () => {
      if (post) {
        await updatePost(post.id, fd)
      } else {
        await createPost(fd)
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <div className="row g-4">
        {/* Main column */}
        <div className="col-lg-8">
          <div className="card form-card p-4 mb-4">
            <div className="mb-3">
              <label className="form-label">Title *</label>
              <input
                name="title"
                type="text"
                className="form-control form-control-lg"
                placeholder="Post title"
                defaultValue={post?.title}
                required
              />
            </div>

            <div>
              <label className="form-label">Content</label>
              <RichEditor name="content" defaultValue={post?.content} />
            </div>
          </div>

          {/* SEO */}
          <div className="card form-card p-4">
            <h6 className="fw-semibold mb-3">
              <i className="ri-seo-line me-2 text-primary" />
              SEO Settings
            </h6>
            <div className="mb-3">
              <label className="form-label">Meta Title</label>
              <input
                name="meta_title"
                type="text"
                className="form-control"
                placeholder="SEO title (leave blank to use post title)"
                defaultValue={post?.meta_title || ''}
              />
            </div>
            <div>
              <label className="form-label">Meta Description</label>
              <textarea
                name="meta_description"
                className="form-control"
                rows={3}
                placeholder="SEO description"
                defaultValue={post?.meta_description || ''}
              />
            </div>
          </div>
        </div>

        {/* Sidebar column */}
        <div className="col-lg-4">
          {/* Publish */}
          <div className="card form-card p-4 mb-4">
            <h6 className="fw-semibold mb-3">Publish</h6>
            <div className="mb-3">
              <label className="form-label">Status</label>
              <select name="status" className="form-select" defaultValue={post?.status || 'draft'}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Saving...
                </>
              ) : post ? (
                'Update Post'
              ) : (
                'Publish Post'
              )}
            </button>
          </div>

          {/* Featured Image */}
          <div className="card form-card p-4 mb-4">
            <h6 className="fw-semibold mb-3">Featured Image</h6>
            <input
              name="featured_image"
              type="url"
              className="form-control"
              placeholder="https://..."
              defaultValue={post?.featured_image || ''}
            />
            <small className="text-muted mt-1 d-block">Enter an image URL</small>
          </div>

          {/* Category */}
          <div className="card form-card p-4 mb-4">
            <h6 className="fw-semibold mb-3">Category</h6>
            <select name="category_id" className="form-select" defaultValue={post?.category_id || ''}>
              <option value="">None</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="card form-card p-4">
            <h6 className="fw-semibold mb-3">Tags</h6>
            <div className="d-flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`btn btn-sm ${
                    selectedTags.includes(tag.id)
                      ? 'btn-primary'
                      : 'btn-outline-secondary'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
              {tags.length === 0 && (
                <p className="text-muted small mb-0">No tags yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
