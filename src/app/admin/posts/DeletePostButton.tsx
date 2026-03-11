'use client'

import { useTransition } from 'react'
import { deletePost } from '@/lib/actions/posts'

export default function DeletePostButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('Delete this post?')) return
    startTransition(() => deletePost(id))
  }

  return (
    <button
      onClick={handleDelete}
      className="btn btn-sm btn-outline-danger"
      disabled={isPending}
      title="Delete"
    >
      {isPending ? (
        <span className="spinner-border spinner-border-sm" />
      ) : (
        <i className="ri-delete-bin-line" />
      )}
    </button>
  )
}
