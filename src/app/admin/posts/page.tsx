import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/ui/Topbar'
import Link from 'next/link'
import DeletePostButton from './DeletePostButton'

export default async function PostsPage() {
  const supabase = await createClient()

  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('id, title, slug, status, created_at, category_id, author_id')
    .order('created_at', { ascending: false })

  if (postsError) console.error('[admin/posts] query error:', postsError.message, postsError.code, postsError.details, postsError.hint)

  return (
    <>
      <Topbar title="Posts" />
      <div className="page-content">
        <div className="card table-card">
          <div className="card-header bg-white py-3 d-flex align-items-center justify-content-between">
            <h6 className="mb-0 fw-semibold">All Posts</h6>
            <Link href="/admin/posts/new" className="btn btn-sm btn-primary">
              <i className="ri-add-line me-1" />
              Add New
            </Link>
          </div>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts && posts.length > 0 ? (
                  posts.map((post: any) => (
                    <tr key={post.id}>
                      <td className="fw-medium">{post.title}</td>
                      <td className="text-muted small">—</td>
                      <td className="text-muted small">—</td>
                      <td>
                        <span className={`badge-status ${post.status}`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="text-muted small">
                        {new Date(post.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Link
                            href={`/admin/posts/${post.id}`}
                            className="btn btn-sm btn-outline-secondary"
                            title="Edit"
                          >
                            <i className="ri-edit-line" />
                          </Link>
                          {post.status === 'published' && (
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              className="btn btn-sm btn-outline-info"
                              title="View"
                            >
                              <i className="ri-external-link-line" />
                            </Link>
                          )}
                          <DeletePostButton id={post.id} />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      No posts yet.{' '}
                      <Link href="/admin/posts/new">Create your first post</Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
