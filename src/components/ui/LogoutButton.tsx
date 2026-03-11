'use client'

import { logout } from '@/lib/actions/auth'

export default function LogoutButton() {
  return (
    <form action={logout}>
      <button type="submit" className="dropdown-item text-danger">
        <i className="ri-logout-box-r-line me-2" />
        Logout
      </button>
    </form>
  )
}
