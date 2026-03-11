'use client'

import { useState, useTransition } from 'react'
import { createCategory, updateCategory, deleteCategory, toggleCategoryMenu } from '@/lib/actions/categories'
import type { Category } from '@/types'

interface Props {
  categories: (Category & { show_in_menu: boolean })[]
}

export default function CategoryManager({ categories }: Props) {
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(() => createCategory(fd))
    e.currentTarget.reset()
  }

  function handleUpdate(id: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      await updateCategory(id, fd)
      setEditingId(null)
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this category?')) return
    startTransition(() => deleteCategory(id))
  }

  function handleToggleMenu(id: string, current: boolean) {
    startTransition(() => toggleCategoryMenu(id, !current))
  }

  return (
    <div className="row g-4">
      <div className="col-md-5">
        <div className="card form-card p-4">
          <h6 className="fw-semibold mb-3">Add New Category</h6>
          <form onSubmit={handleCreate}>
            <div className="mb-3">
              <label className="form-label">Name *</label>
              <input name="name" type="text" className="form-control" placeholder="Category name" required />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-control" rows={3} placeholder="Optional description" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isPending}>
              {isPending ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="ri-add-line me-1" />}
              Add Category
            </button>
          </form>
        </div>
      </div>

      <div className="col-md-7">
        <div className="card table-card">
          <div className="card-header bg-white py-3">
            <h6 className="mb-0 fw-semibold">All Categories ({categories.length})</h6>
          </div>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th title="Show in navigation menu">Menu</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-4">No categories yet.</td>
                  </tr>
                )}
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    {editingId === cat.id ? (
                      <td colSpan={3}>
                        <form onSubmit={(e) => handleUpdate(cat.id, e)} className="d-flex gap-2">
                          <input name="name" className="form-control form-control-sm" defaultValue={cat.name} required />
                          <input name="description" className="form-control form-control-sm" defaultValue={cat.description || ''} placeholder="Description" />
                          <button type="submit" className="btn btn-sm btn-success" disabled={isPending}>
                            <i className="ri-check-line" />
                          </button>
                          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setEditingId(null)}>
                            <i className="ri-close-line" />
                          </button>
                        </form>
                      </td>
                    ) : (
                      <>
                        <td className="fw-medium">{cat.name}</td>
                        <td className="text-muted small">{cat.slug}</td>
                        <td>
                          <div className="form-check form-switch mb-0">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              checked={cat.show_in_menu}
                              onChange={() => handleToggleMenu(cat.id, cat.show_in_menu)}
                              disabled={isPending}
                              title={cat.show_in_menu ? 'Remove from menu' : 'Add to menu'}
                            />
                          </div>
                        </td>
                      </>
                    )}
                    {editingId !== cat.id && (
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setEditingId(cat.id)}
                            title="Edit"
                          >
                            <i className="ri-edit-line" />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(cat.id)}
                            disabled={isPending}
                            title="Delete"
                          >
                            <i className="ri-delete-bin-line" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
