'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  {
    label: 'Main',
    links: [
      { href: '/admin', icon: 'ri-home-5-line', label: 'Dashboard' },
    ],
  },
  {
    label: 'Content',
    links: [
      { href: '/admin/posts', icon: 'ri-file-text-line', label: 'All Posts' },
      { href: '/admin/posts/new', icon: 'ri-add-circle-line', label: 'New Post' },
      { href: '/admin/categories', icon: 'ri-folder-3-line', label: 'Categories' },
      { href: '/admin/tags', icon: 'ri-price-tag-3-line', label: 'Tags' },
    ],
  },
  {
    label: 'Media',
    links: [
      { href: '/admin/media', icon: 'ri-image-2-line', label: 'Media Library' },
    ],
  },
  {
    label: 'Admin',
    links: [
      { href: '/admin/users', icon: 'ri-team-line', label: 'Users' },
      { href: '/admin/settings', icon: 'ri-settings-4-line', label: 'Settings' },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <aside className="sidebar">
      {/* Brand */}
      <Link href="/admin" className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <i className="ri-quill-pen-fill" />
        </div>
        <span>NextPress</span>
      </Link>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map((section) => (
          <div key={section.label} className="sidebar-section">
            <div className="nav-label">{section.label}</div>
            {section.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${isActive(link.href) ? 'active' : ''}`}
              >
                <i className={link.icon} />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <Link href="/blog" target="_blank" className="sidebar-view-site">
          <i className="ri-external-link-line" />
          View Site
        </Link>
        <button className="sidebar-logout" onClick={handleLogout}>
          <i className="ri-logout-box-r-line" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
