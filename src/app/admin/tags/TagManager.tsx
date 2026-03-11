'use client'

import { useTransition } from 'react'
import { createTag, deleteTag } from '@/lib/actions/tags'
import type { Tag } from '@/types'

export default function TagManager({ tags }: { tags: Tag[] }) {
  const [isPending, startTransition] = useTransition()

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(() => createTag(fd))
    e.currentTarget.reset()
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this tag?')) return
    startTransition(() => deleteTag(id))
  }

  return (
    <div className="row g-4">
      <div className="col-md-4">
        <div className="card form-card p-4">
          <h6 className="fw-semibold mb-3">Add New Tag</h6>
          <form onSubmit={handleCreate}>
            <div className="mb-3">
              <label className="form-label">Name *</label>
              <input name="name" type="text" className="form-control" placeholder="Tag name" required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isPending}>
              {isPending ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="ri-add-line me-1" />}
              Add Tag
            </button>
          </form>
        </div>
      </div>

      <div className="col-md-8">
        <div className="card table-card">
          <div className="card-header bg-white py-3">
            <h6 className="mb-0 fw-semibold">All Tags ({tags.length})</h6>
          </div>
          <div className="card-body">
            <div className="d-flex flex-wrap gap-2">
              {tags.length === 0 && (
                <p className="text-muted">No tags yet.</p>
              )}
              {tags.map((tag) => (
                <div key={tag.id} className="tag-chip-admin">
                  <span>{tag.name}</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(tag.id)}
                    disabled={isPending}
                    title="Delete"
                  >
                    <i className="ri-close-line" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
