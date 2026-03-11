import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/ui/Topbar'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // Last 7 days for chart
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return {
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      start: new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString(),
      end: new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).toISOString(),
    }
  })

  const [
    { count: totalPosts },
    { count: publishedPosts },
    { count: totalCategories },
    { count: totalTags },
    { count: viewsToday },
    { count: viewsWeek },
    { count: viewsMonth },
    { count: viewsTotal },
    { data: recentPosts },
    { data: topPages },
    ...dailyCounts
  ] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('tags').select('*', { count: 'exact', head: true }),
    supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
    supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', weekStart),
    supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', monthStart),
    supabase.from('page_views').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('id, title, status, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('page_views').select('path').limit(500),
    ...days.map(d =>
      supabase.from('page_views').select('*', { count: 'exact', head: true })
        .gte('created_at', d.start).lt('created_at', d.end)
    ),
  ])

  // Aggregate top pages from raw data
  const pageCount: Record<string, number> = {}
  topPages?.forEach((v: any) => {
    pageCount[v.path] = (pageCount[v.path] || 0) + 1
  })
  const topPagesRanked = Object.entries(pageCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const dailyData = days.map((d, i) => ({
    label: d.label,
    count: (dailyCounts[i] as any).count ?? 0,
  }))
  const maxDaily = Math.max(...dailyData.map(d => d.count), 1)

  const cmsStats = [
    { label: 'Total Posts', value: totalPosts ?? 0, icon: 'ri-file-text-line', color: '#FC4308', bg: 'rgba(252,67,8,0.1)' },
    { label: 'Published', value: publishedPosts ?? 0, icon: 'ri-checkbox-circle-line', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Categories', value: totalCategories ?? 0, icon: 'ri-folder-line', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Tags', value: totalTags ?? 0, icon: 'ri-price-tag-3-line', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  ]

  const trafficStats = [
    { label: 'Today', value: viewsToday ?? 0, icon: 'ri-sun-line', color: '#FC4308', bg: 'rgba(252,67,8,0.1)' },
    { label: 'This Week', value: viewsWeek ?? 0, icon: 'ri-calendar-week-line', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
    { label: 'This Month', value: viewsMonth ?? 0, icon: 'ri-calendar-line', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
    { label: 'All Time', value: viewsTotal ?? 0, icon: 'ri-bar-chart-line', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  ]

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="page-content">

        {/* CMS Stats */}
        <div className="analytics-section-label">Content</div>
        <div className="row g-4 mb-5">
          {cmsStats.map((stat) => (
            <div key={stat.label} className="col-sm-6 col-xl-3">
              <div className="card stat-card">
                <div className="card-body d-flex align-items-center gap-3 p-4">
                  <div className="stat-icon" style={{ background: stat.bg }}>
                    <i className={stat.icon} style={{ color: stat.color }} />
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

        {/* Traffic Stats */}
        <div className="analytics-section-label">Traffic</div>
        <div className="row g-4 mb-5">
          {trafficStats.map((stat) => (
            <div key={stat.label} className="col-sm-6 col-xl-3">
              <div className="card stat-card">
                <div className="card-body d-flex align-items-center gap-3 p-4">
                  <div className="stat-icon" style={{ background: stat.bg }}>
                    <i className={stat.icon} style={{ color: stat.color }} />
                  </div>
                  <div>
                    <div className="fs-4 fw-bold">{stat.value.toLocaleString()}</div>
                    <div className="text-muted small">{stat.label}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-4 mb-4">
          {/* Daily Chart */}
          <div className="col-lg-8">
            <div className="card table-card h-100">
              <div className="card-header bg-white py-3">
                <h6 className="mb-0 fw-semibold">
                  <i className="ri-bar-chart-2-line me-2 text-primary" />
                  Page Views — Last 7 Days
                </h6>
              </div>
              <div className="card-body p-4">
                <div className="analytics-bar-chart">
                  {dailyData.map((d) => (
                    <div key={d.label} className="analytics-bar-col">
                      <span className="analytics-bar-value">{d.count}</span>
                      <div
                        className="analytics-bar"
                        style={{ height: `${Math.max(4, (d.count / maxDaily) * 100)}%` }}
                      />
                      <span className="analytics-bar-label">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Pages */}
          <div className="col-lg-4">
            <div className="card table-card h-100">
              <div className="card-header bg-white py-3">
                <h6 className="mb-0 fw-semibold">
                  <i className="ri-pages-line me-2 text-primary" />
                  Top Pages
                </h6>
              </div>
              <div className="card-body p-0">
                {topPagesRanked.length > 0 ? (
                  <ul className="analytics-top-pages">
                    {topPagesRanked.map(([path, count]) => (
                      <li key={path}>
                        <span className="analytics-top-path">{path}</span>
                        <span className="analytics-top-count">{count}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted small p-4 mb-0">No data yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Posts */}
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
                      <td>
                        <span className={`badge-status ${post.status}`}>{post.status}</span>
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
                    <td colSpan={4} className="text-center text-muted py-4">
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
