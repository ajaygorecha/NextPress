import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/ui/Topbar'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalPosts },
    { count: publishedPosts },
    { count: totalCategories },
    { count: totalTags },
  ] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('tags').select('*', { count: 'exact', head: true }),
  ])

  const { data: recentPosts, error: recentError } = await supabase
    .from('posts')
    .select('id, title, status, created_at, author_id')
    .order('created_at', { ascending: false })
    .limit(5)

  if (recentError) console.error('[admin/dashboard] recent posts error:', recentError.message, recentError.code)

  const stats = [
    { label: 'Total Posts', value: totalPosts ?? 0, icon: 'ri-file-text-line', color: 'primary', bg: 'rgba(99,102,241,0.1)' },
    { label: 'Published', value: publishedPosts ?? 0, icon: 'ri-checkbox-circle-line', color: 'success', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Categories', value: totalCategories ?? 0, icon: 'ri-folder-line', color: 'warning', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Tags', value: totalTags ?? 0, icon: 'ri-price-tag-3-line', color: 'info', bg: 'rgba(59,130,246,0.1)' },
  ]

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="page-content">
        <div className="row g-4 mb-4">
          {stats.map((stat) => (
            <div key={stat.label} className="col-sm-6 col-xl-3">
              <div className="card stat-card">
                <div className="card-body d-flex align-items-center gap-3 p-4">
                  <div className="stat-icon" style={{ background: stat.bg }}>
                    <i className={`${stat.icon} text-${stat.color}`} />
                  </div>
                  <div>
                    <div className="fs-4 fw-bold">{stat.value}</div>
                    <div className="text-muted small">{stat.label}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card table-card">
          <div className="card-header bg-white py-3 d-flex align-items-center justify-content-between">
            <h6 className="mb-0 fw-semibold">Recent Posts</h6>
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
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentPosts && recentPosts.length > 0 ? (
                  recentPosts.map((post: any) => (
                    <tr key={post.id}>
                      <td className="fw-medium">{post.title}</td>
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
                        <Link href={`/admin/posts/${post.id}`} className="btn btn-sm btn-outline-secondary">
                          <i className="ri-edit-line" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
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
