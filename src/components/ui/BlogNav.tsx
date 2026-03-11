import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function BlogNav() {
  const supabase = await createClient()

  const [{ data: { user } }, { data: menuCategories }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('categories')
      .select('id, name, slug')
      .eq('show_in_menu', true)
      .order('name'),
  ])

  return (
    <nav className="blog-navbar navbar navbar-expand-md sticky-top">
      <div className="container">
        <Link className="navbar-brand" href="/blog">
          <i className="ri-quill-pen-fill me-2" />
          NextPress
        </Link>
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#blogNav"
        >
          <i className="ri-menu-line fs-5" />
        </button>
        <div className="collapse navbar-collapse" id="blogNav">
          <ul className="navbar-nav ms-auto align-items-center gap-1">
            {menuCategories && menuCategories.map((cat) => (
              <li key={cat.id} className="nav-item">
                <Link className="nav-link" href={`/category/${cat.slug}`}>
                  {cat.name}
                </Link>
              </li>
            ))}
            {user && (
              <li className="nav-item ms-1">
                <Link className="nav-link nav-admin-btn" href="/admin">
                  <i className="ri-dashboard-line me-1" />
                  Dashboard
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
