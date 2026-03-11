import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from './LogoutButton'

interface Props {
  title: string
}

export default async function Topbar({ title }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const displayName = user?.user_metadata?.name || user?.email || 'User'
  const initial = displayName[0].toUpperCase()

  return (
    <header className="topbar">
      <span className="topbar-title">{title}</span>

      <div className="d-flex align-items-center gap-3">
        <Link href="/blog" target="_blank" className="btn btn-sm btn-outline-secondary">
          <i className="ri-external-link-line me-1" />
          View Site
        </Link>

        <div className="dropdown">
          <button
            className="btn btn-sm d-flex align-items-center gap-2 border-0 bg-transparent p-0"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
              style={{ width: 32, height: 32, fontSize: '0.85rem', fontWeight: 600 }}
            >
              {initial}
            </div>
            <span className="small d-none d-md-inline text-muted">{displayName}</span>
            <i className="ri-arrow-down-s-line text-muted small" />
          </button>

          <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">
            <li>
              <Link href="/admin/settings" className="dropdown-item">
                <i className="ri-settings-3-line me-2" />
                Settings
              </Link>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <LogoutButton />
            </li>
          </ul>
        </div>
      </div>
    </header>
  )
}
