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

      <div className="d-flex align-items-center gap-2">
        <div className="dropdown">
          <button
            className="topbar-user-btn"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <div className="topbar-avatar">{initial}</div>
            <span className="topbar-username d-none d-md-inline">{displayName}</span>
            <i className="ri-arrow-down-s-line topbar-chevron" />
          </button>

          <ul className="dropdown-menu dropdown-menu-end">
            <li className="dropdown-user-info">
              <div className="topbar-avatar topbar-avatar--lg">{initial}</div>
              <div>
                <div className="fw-bold small">{displayName}</div>
                <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{user?.email}</div>
              </div>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <Link href="/admin/settings" className="dropdown-item">
                <i className="ri-settings-4-line" />
                Settings
              </Link>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li><LogoutButton /></li>
          </ul>
        </div>
      </div>
    </header>
  )
}
