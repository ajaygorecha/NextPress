'use client'

import { useRef, useState, useTransition } from 'react'
import { createPost, updatePost } from '@/lib/actions/posts'
import RichEditor from '@/components/editor/RichEditor'
import { createClient } from '@/lib/supabase/client'
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
  const [featuredImage, setFeaturedImage] = useState(post?.featured_image || '')
  const [mediaOpen, setMediaOpen] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<{ name: string; url: string }[]>([])
  const [mediaLoading, setMediaLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  async function openMediaPicker() {
    setMediaOpen(true)
    if (mediaFiles.length > 0) return
    setMediaLoading(true)
    const supabase = createClient()
    const { data } = await supabase.storage.from('media').list('', {
      sortBy: { column: 'created_at', order: 'desc' },
      limit: 100,
    })
    const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif']
    const files = (data || [])
      .filter(f => IMAGE_EXTS.includes(f.name.split('.').pop()?.toLowerCase() || ''))
      .map(f => ({
        name: f.name,
        url: `${supabaseUrl}/storage/v1/object/public/media/${f.name}`,
      }))
    setMediaFiles(files)
    setMediaLoading(false)
  }

  function selectMedia(url: string) {
    setFeaturedImage(url)
    setMediaOpen(false)
  }

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
            {featuredImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={featuredImage}
                alt="Featured"
                className="featured-image-preview mb-3"
              />
            )}
            <input
              name="featured_image"
              type="url"
              className="form-control mb-2"
              placeholder="https://..."
              value={featuredImage}
              onChange={e => setFeaturedImage(e.target.value)}
            />
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-outline-secondary btn-sm flex-1" onClick={openMediaPicker}>
                <i className="ri-image-line me-1" />
                Select from Media
              </button>
              {featuredImage && (
                <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => setFeaturedImage('')}>
                  <i className="ri-close-line" />
                </button>
              )}
            </div>
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
      {/* Media Picker Modal */}
      {mediaOpen && (
        <div className="modal d-block media-picker-backdrop" onClick={() => setMediaOpen(false)}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title fw-semibold">
                  <i className="ri-image-line me-2 text-primary" />
                  Select from Media Library
                </h6>
                <button className="btn-close" onClick={() => setMediaOpen(false)} />
              </div>
              <div className="modal-body">
                {mediaLoading ? (
                  <div className="text-center py-5">
                    <span className="spinner-border text-primary" />
                    <p className="text-muted mt-2 small">Loading media…</p>
                  </div>
                ) : mediaFiles.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="ri-image-line" style={{ fontSize: '3rem' }} />
                    <p className="mt-2">No images in media library yet.</p>
                  </div>
                ) : (
                  <div className="media-picker-grid">
                    {mediaFiles.map(file => (
                      <button
                        key={file.name}
                        type="button"
                        className={`media-picker-item ${featuredImage === file.url ? 'selected' : ''}`}
                        onClick={() => selectMedia(file.url)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={file.url} alt={file.name} />
                        {featuredImage === file.url && (
                          <div className="media-picker-check">
                            <i className="ri-check-line" />
                          </div>
                        )}
                        <div className="media-picker-name">{file.name}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
